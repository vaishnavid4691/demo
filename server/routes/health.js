const express = require('express');
const router = express.Router();

// Health check analysis endpoint
router.post('/analyze', (req, res) => {
  try {
    const { extractedText, language = 'en' } = req.body;

    if (!extractedText) {
      return res.status(400).json({ error: 'Extracted text is required' });
    }

    // Mock health analysis - in production, use proper text analysis
    const analysis = {
      fssaiStatus: 'unknown',
      expiryStatus: 'unknown',
      fssaiNumber: null,
      expiryDate: null,
      warnings: [],
      recommendations: [],
      healthScore: 50
    };

    const textLower = extractedText.toLowerCase();

    // Check for FSSAI license
    const fssaiMatch = extractedText.match(/fssai[:\s]*(\d{14})/i);
    if (fssaiMatch) {
      analysis.fssaiNumber = fssaiMatch[1];
      analysis.fssaiStatus = 'valid';
      analysis.healthScore += 30;
    } else if (textLower.includes('fssai')) {
      analysis.fssaiStatus = 'found_but_unreadable';
      analysis.warnings.push('FSSAI license found but not readable');
    } else {
      analysis.fssaiStatus = 'not_found';
      analysis.warnings.push('FSSAI license number not found');
    }

    // Check for expiry date
    const dateMatch = extractedText.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
    if (dateMatch) {
      const dateStr = dateMatch[1];
      const parts = dateStr.split(/[\/\-\.]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]) + (parts[2].length === 2 ? 2000 : 0);
        
        const expiryDate = new Date(year, month - 1, day);
        const today = new Date();
        
        analysis.expiryDate = expiryDate.toISOString();
        
        if (expiryDate < today) {
          analysis.expiryStatus = 'expired';
          analysis.warnings.push('Product has expired');
        } else if (expiryDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
          analysis.expiryStatus = 'expiring_soon';
          analysis.warnings.push('Product expiring within 7 days');
        } else {
          analysis.expiryStatus = 'valid';
          analysis.healthScore += 20;
        }
      }
    }

    // Additional checks
    if (textLower.includes('organic')) {
      analysis.recommendations.push('Organic product - good for health');
      analysis.healthScore += 10;
    }
    if (textLower.includes('natural')) {
      analysis.recommendations.push('Natural ingredients detected');
      analysis.healthScore += 5;
    }

    analysis.healthScore = Math.min(100, analysis.healthScore);

    res.json({
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze health information',
      message: error.message 
    });
  }
});

module.exports = router;