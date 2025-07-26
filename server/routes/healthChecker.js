const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Scan product label for health information
router.post('/scan', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert image buffer to base64
    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    // OCR processing with Tesseract.js
    const { data: { text } } = await Tesseract.recognize(
      imageBuffer,
      'eng+hin', // English and Hindi
      {
        logger: m => console.log(m)
      }
    );

    // Extract relevant information from OCR text
    const extractedInfo = extractHealthInfo(text);

    // Save scan result to database
    const scanResult = {
      userId: req.user.uid,
      userName: req.user.name,
      imageUrl: `data:${req.file.mimetype};base64,${base64Image}`,
      ocrText: text,
      extractedInfo,
      createdAt: new Date()
    };

    const scanRef = await db.collection('healthScans').add(scanResult);

    res.json({
      message: 'Label scanned successfully',
      scanId: scanRef.id,
      extractedInfo,
      ocrText: text
    });

  } catch (error) {
    console.error('Health checker scan error:', error);
    res.status(500).json({ error: 'Failed to scan label' });
  }
});

// Get user's scan history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const scansRef = db.collection('healthScans');
    const snapshot = await scansRef
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const scans = [];
    snapshot.forEach(doc => {
      const scanData = doc.data();
      scans.push({
        id: doc.id,
        extractedInfo: scanData.extractedInfo,
        createdAt: scanData.createdAt,
        imageUrl: scanData.imageUrl
      });
    });

    res.json({ scans });

  } catch (error) {
    console.error('Get scan history error:', error);
    res.status(500).json({ error: 'Failed to fetch scan history' });
  }
});

// Get specific scan result
router.get('/scan/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const scanRef = db.collection('healthScans').doc(id);
    const scanDoc = await scanRef.get();

    if (!scanDoc.exists) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const scanData = scanDoc.data();

    // Check if user owns this scan
    if (scanData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to view this scan' });
    }

    res.json({
      scan: {
        id: scanDoc.id,
        ...scanData
      }
    });

  } catch (error) {
    console.error('Get scan error:', error);
    res.status(500).json({ error: 'Failed to fetch scan' });
  }
});

// Helper function to extract health information from OCR text
function extractHealthInfo(text) {
  const lowerText = text.toLowerCase();
  
  const extractedInfo = {
    hasExpiryDate: false,
    expiryDate: null,
    hasFssaiLicense: false,
    fssaiLicense: null,
    hasIngredients: false,
    ingredients: [],
    hasNutritionInfo: false,
    nutritionInfo: {},
    safetyScore: 0,
    warnings: [],
    recommendations: []
  };

  // Check for expiry date patterns
  const expiryPatterns = [
    /expiry\s*date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /best\s*before[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /use\s*before[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g
  ];

  for (const pattern of expiryPatterns) {
    const match = text.match(pattern);
    if (match) {
      extractedInfo.hasExpiryDate = true;
      extractedInfo.expiryDate = match[1] || match[0];
      break;
    }
  }

  // Check for FSSAI license
  const fssaiPatterns = [
    /fssai\s*license[:\s]*([a-z0-9\-]+)/i,
    /license\s*no[:\s]*([a-z0-9\-]+)/i,
    /fssai[:\s]*([a-z0-9\-]+)/i
  ];

  for (const pattern of fssaiPatterns) {
    const match = text.match(pattern);
    if (match) {
      extractedInfo.hasFssaiLicense = true;
      extractedInfo.fssaiLicense = match[1];
      break;
    }
  }

  // Check for ingredients
  const ingredientKeywords = [
    'ingredients', 'ingredient', 'contains', 'composition', 'made of'
  ];

  for (const keyword of ingredientKeywords) {
    if (lowerText.includes(keyword)) {
      extractedInfo.hasIngredients = true;
      // Extract ingredients list (simplified)
      const ingredientMatch = text.match(new RegExp(`${keyword}[:\s]*(.+)`, 'i'));
      if (ingredientMatch) {
        extractedInfo.ingredients = ingredientMatch[1].split(/[,;]/).map(i => i.trim());
      }
      break;
    }
  }

  // Check for nutrition information
  const nutritionKeywords = [
    'nutrition', 'nutritional', 'calories', 'protein', 'fat', 'carbohydrates'
  ];

  for (const keyword of nutritionKeywords) {
    if (lowerText.includes(keyword)) {
      extractedInfo.hasNutritionInfo = true;
      break;
    }
  }

  // Calculate safety score
  let safetyScore = 50; // Base score

  if (extractedInfo.hasExpiryDate) safetyScore += 20;
  if (extractedInfo.hasFssaiLicense) safetyScore += 25;
  if (extractedInfo.hasIngredients) safetyScore += 15;
  if (extractedInfo.hasNutritionInfo) safetyScore += 10;

  // Check for warnings
  const warningKeywords = [
    'artificial', 'preservative', 'additive', 'color', 'flavor', 'msg', 'trans fat'
  ];

  for (const keyword of warningKeywords) {
    if (lowerText.includes(keyword)) {
      extractedInfo.warnings.push(`Contains ${keyword}`);
      safetyScore -= 10;
    }
  }

  // Add recommendations
  if (!extractedInfo.hasExpiryDate) {
    extractedInfo.recommendations.push('Check for expiry date');
  }
  if (!extractedInfo.hasFssaiLicense) {
    extractedInfo.recommendations.push('Verify FSSAI license');
  }
  if (extractedInfo.warnings.length > 0) {
    extractedInfo.recommendations.push('Review ingredients for artificial additives');
  }

  extractedInfo.safetyScore = Math.max(0, Math.min(100, safetyScore));

  return extractedInfo;
}

// Get FSSAI license verification
router.post('/verify-fssai', authenticateToken, [
  body('licenseNumber').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { licenseNumber } = req.body;

    // Check if license exists in our database
    const licenseRef = db.collection('fssaiLicenses');
    const snapshot = await licenseRef.where('licenseNumber', '==', licenseNumber).get();

    if (snapshot.empty) {
      return res.json({
        isValid: false,
        message: 'FSSAI license not found in database'
      });
    }

    const licenseDoc = snapshot.docs[0];
    const licenseData = licenseDoc.data();

    res.json({
      isValid: true,
      license: {
        number: licenseData.licenseNumber,
        holderName: licenseData.holderName,
        businessName: licenseData.businessName,
        address: licenseData.address,
        expiryDate: licenseData.expiryDate,
        status: licenseData.status
      }
    });

  } catch (error) {
    console.error('FSSAI verification error:', error);
    res.status(500).json({ error: 'Failed to verify FSSAI license' });
  }
});

module.exports = router;