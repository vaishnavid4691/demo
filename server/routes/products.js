const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/firebase');
const { authenticateToken, requireSupplier } = require('../middleware/auth');

const router = express.Router();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, supplier, minPrice, maxPrice, search } = req.query;
    let query = db.collection('products');

    // Apply filters
    if (category) {
      query = query.where('category', '==', category);
    }
    if (supplier) {
      query = query.where('supplierId', '==', supplier);
    }
    if (minPrice || maxPrice) {
      if (minPrice) query = query.where('price', '>=', parseFloat(minPrice));
      if (maxPrice) query = query.where('price', '<=', parseFloat(maxPrice));
    }

    const snapshot = await query.get();
    let products = [];

    snapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return;
      }
      
      products.push(product);
    });

    // Sort by price (lowest first)
    products.sort((a, b) => a.price - b.price);

    res.json({
      products,
      total: products.length
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = { id: productDoc.id, ...productDoc.data() };

    // Get supplier information
    if (product.supplierId) {
      const supplierRef = db.collection('users').doc(product.supplierId);
      const supplierDoc = await supplierRef.get();
      if (supplierDoc.exists) {
        const supplierData = supplierDoc.data();
        product.supplier = {
          name: supplierData.name,
          phone: supplierData.phone,
          address: supplierData.address
        };
      }
    }

    res.json({ product });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Add new product (supplier only)
router.post('/', authenticateToken, requireSupplier, [
  body('name').notEmpty().trim(),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }),
  body('category').notEmpty().trim(),
  body('stock').isInt({ min: 0 }),
  body('unit').notEmpty().trim(),
  body('fssaiLicense').optional().trim(),
  body('expiryDate').optional().isISO8601(),
  body('imageUrl').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      price,
      category,
      stock,
      unit,
      fssaiLicense,
      expiryDate,
      imageUrl
    } = req.body;

    const productData = {
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      unit,
      supplierId: req.user.uid,
      supplierName: req.user.name,
      fssaiLicense: fssaiLicense || '',
      expiryDate: expiryDate || null,
      imageUrl: imageUrl || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const productRef = await db.collection('products').add(productData);
    const product = { id: productRef.id, ...productData };

    res.status(201).json({
      message: 'Product added successfully',
      product
    });

  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update product (supplier only)
router.put('/:id', authenticateToken, requireSupplier, [
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().trim(),
  body('stock').optional().isInt({ min: 0 }),
  body('unit').optional().trim(),
  body('fssaiLicense').optional().trim(),
  body('expiryDate').optional().isISO8601(),
  body('imageUrl').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productData = productDoc.data();
    
    // Check if user owns this product
    if (productData.supplierId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const updateData = {
      updatedAt: new Date()
    };

    // Only update provided fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        if (key === 'price') updateData[key] = parseFloat(req.body[key]);
        else if (key === 'stock') updateData[key] = parseInt(req.body[key]);
        else updateData[key] = req.body[key];
      }
    });

    await productRef.update(updateData);

    res.json({
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (supplier only)
router.delete('/:id', authenticateToken, requireSupplier, async (req, res) => {
  try {
    const { id } = req.params;
    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productData = productDoc.data();
    
    // Check if user owns this product
    if (productData.supplierId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await productRef.delete();

    res.json({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get product categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = [
      'Fruits',
      'Vegetables',
      'Grains',
      'Spices',
      'Dairy',
      'Meat',
      'Seafood',
      'Beverages',
      'Snacks',
      'Condiments',
      'Others'
    ];

    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;