const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { db, storage } = require('../config/firebase');
const { authenticateToken, requireSupplier } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'), false);
    }
  }
});

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const { verified, category } = req.query;
    let query = db.collection('users').where('role', '==', 'supplier');

    if (verified === 'true') {
      query = query.where('fssaiVerified', '==', true);
    }

    const snapshot = await query.get();
    const suppliers = [];

    for (const doc of snapshot.docs) {
      const supplierData = doc.data();
      
      // Get supplier's products if category filter is applied
      if (category) {
        const productsSnapshot = await db.collection('products')
          .where('supplierId', '==', doc.id)
          .where('category', '==', category)
          .get();
        
        if (productsSnapshot.empty) continue;
      }

      // Get product count
      const productsSnapshot = await db.collection('products')
        .where('supplierId', '==', doc.id)
        .get();

      suppliers.push({
        id: doc.id,
        name: supplierData.name,
        email: supplierData.email,
        phone: supplierData.phone,
        address: supplierData.address,
        fssaiVerified: supplierData.fssaiVerified || false,
        fssaiLicense: supplierData.fssaiLicense || '',
        businessName: supplierData.businessName || '',
        productCount: productsSnapshot.size,
        rating: supplierData.rating || 0,
        reviewCount: supplierData.reviewCount || 0,
        createdAt: supplierData.createdAt
      });
    }

    // Sort by rating (highest first)
    suppliers.sort((a, b) => b.rating - a.rating);

    res.json({
      suppliers,
      total: suppliers.length
    });

  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Get supplier by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supplierRef = db.collection('users').doc(id);
    const supplierDoc = await supplierRef.get();

    if (!supplierDoc.exists) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const supplierData = supplierDoc.data();

    if (supplierData.role !== 'supplier') {
      return res.status(404).json({ error: 'User is not a supplier' });
    }

    // Get supplier's products
    const productsSnapshot = await db.collection('products')
      .where('supplierId', '==', id)
      .get();

    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    // Get supplier's reviews
    const reviewsSnapshot = await db.collection('reviews')
      .where('supplierId', '==', id)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const reviews = [];
    reviewsSnapshot.forEach(doc => {
      const reviewData = doc.data();
      reviews.push({
        id: doc.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        userName: reviewData.userName,
        createdAt: reviewData.createdAt
      });
    });

    res.json({
      supplier: {
        id: supplierDoc.id,
        name: supplierData.name,
        email: supplierData.email,
        phone: supplierData.phone,
        address: supplierData.address,
        fssaiVerified: supplierData.fssaiVerified || false,
        fssaiLicense: supplierData.fssaiLicense || '',
        businessName: supplierData.businessName || '',
        fssaiCertificateUrl: supplierData.fssaiCertificateUrl || '',
        rating: supplierData.rating || 0,
        reviewCount: supplierData.reviewCount || 0,
        products,
        reviews
      }
    });

  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// Update supplier profile
router.put('/profile', authenticateToken, requireSupplier, [
  body('businessName').optional().trim(),
  body('phone').optional().isMobilePhone(),
  body('address').optional().trim(),
  body('fssaiLicense').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { businessName, phone, address, fssaiLicense } = req.body;
    const updateData = {
      updatedAt: new Date()
    };

    if (businessName) updateData.businessName = businessName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (fssaiLicense) updateData.fssaiLicense = fssaiLicense;

    await db.collection('users').doc(req.user.uid).update(updateData);

    res.json({
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update supplier profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload FSSAI certificate
router.post('/upload-fssai', authenticateToken, requireSupplier, upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No certificate file provided' });
    }

    const { fssaiLicense } = req.body;

    if (!fssaiLicense) {
      return res.status(400).json({ error: 'FSSAI license number is required' });
    }

    // Upload file to Firebase Storage
    const bucket = storage.bucket();
    const fileName = `fssai-certificates/${req.user.uid}/${Date.now()}-${req.file.originalname}`;
    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype
      }
    });

    // Get public URL
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // Update user profile
    await db.collection('users').doc(req.user.uid).update({
      fssaiLicense,
      fssaiCertificateUrl: publicUrl,
      fssaiVerified: false, // Will be verified by admin
      updatedAt: new Date()
    });

    res.json({
      message: 'FSSAI certificate uploaded successfully',
      certificateUrl: publicUrl
    });

  } catch (error) {
    console.error('Upload FSSAI certificate error:', error);
    res.status(500).json({ error: 'Failed to upload certificate' });
  }
});

// Add supplier review
router.post('/:id/review', authenticateToken, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { rating, comment } = req.body;

    // Check if supplier exists
    const supplierRef = db.collection('users').doc(id);
    const supplierDoc = await supplierRef.get();

    if (!supplierDoc.exists) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const supplierData = supplierDoc.data();
    if (supplierData.role !== 'supplier') {
      return res.status(400).json({ error: 'User is not a supplier' });
    }

    // Check if user already reviewed this supplier
    const existingReviewSnapshot = await db.collection('reviews')
      .where('supplierId', '==', id)
      .where('userId', '==', req.user.uid)
      .get();

    if (!existingReviewSnapshot.empty) {
      return res.status(400).json({ error: 'You have already reviewed this supplier' });
    }

    // Add review
    const reviewData = {
      supplierId: id,
      userId: req.user.uid,
      userName: req.user.name,
      rating: parseInt(rating),
      comment: comment || '',
      createdAt: new Date()
    };

    await db.collection('reviews').add(reviewData);

    // Update supplier's average rating
    const allReviewsSnapshot = await db.collection('reviews')
      .where('supplierId', '==', id)
      .get();

    let totalRating = 0;
    allReviewsSnapshot.forEach(doc => {
      totalRating += doc.data().rating;
    });

    const averageRating = totalRating / allReviewsSnapshot.size;

    await supplierRef.update({
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: allReviewsSnapshot.size,
      updatedAt: new Date()
    });

    res.json({
      message: 'Review added successfully',
      review: reviewData
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Get supplier statistics
router.get('/:id/stats', authenticateToken, requireSupplier, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user owns this supplier profile
    if (req.user.uid !== id) {
      return res.status(403).json({ error: 'Not authorized to view these statistics' });
    }

    // Get total products
    const productsSnapshot = await db.collection('products')
      .where('supplierId', '==', id)
      .get();

    // Get total orders
    const ordersSnapshot = await db.collection('orders')
      .where('supplierId', '==', id)
      .get();

    // Get total revenue
    let totalRevenue = 0;
    ordersSnapshot.forEach(doc => {
      const orderData = doc.data();
      if (orderData.status === 'completed') {
        totalRevenue += orderData.total;
      }
    });

    // Get products by category
    const categoryStats = {};
    productsSnapshot.forEach(doc => {
      const productData = doc.data();
      const category = productData.category;
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    // Get recent orders
    const recentOrdersSnapshot = await db.collection('orders')
      .where('supplierId', '==', id)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const recentOrders = [];
    recentOrdersSnapshot.forEach(doc => {
      const orderData = doc.data();
      recentOrders.push({
        id: doc.id,
        total: orderData.total,
        status: orderData.status,
        createdAt: orderData.createdAt
      });
    });

    res.json({
      stats: {
        totalProducts: productsSnapshot.size,
        totalOrders: ordersSnapshot.size,
        totalRevenue,
        categoryStats,
        recentOrders
      }
    });

  } catch (error) {
    console.error('Get supplier stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;