const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken, authorize, requireVerifiedSupplier, optionalAuth } = require('../middleware/auth');
const { validateProduct, validatePagination, validateProductQuery, validateObjectId } = require('../middleware/validation');

// @route   GET /api/products
// @desc    Get all products with filters and search
// @access  Public (with optional auth for personalization)
router.get('/', [validatePagination, validateProductQuery], optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      minPrice,
      maxPrice,
      supplier,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      inSeason,
      verified
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.amount'].$lte = parseFloat(maxPrice);
    }

    // Supplier filter
    if (supplier) {
      query.supplier = supplier;
    }

    // In season filter
    if (inSeason === 'true') {
      query.isInSeason = true;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { searchKeywords: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let productQuery = Product.find(query)
      .populate('supplier', 'name businessName phone isVerified averageRating totalReviews address')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // If verified filter is requested, filter by supplier verification
    if (verified === 'true') {
      productQuery = Product.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'supplier',
            foreignField: '_id',
            as: 'supplierInfo'
          }
        },
        {
          $match: {
            'supplierInfo.isVerified': true
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'supplier',
            foreignField: '_id',
            as: 'supplier',
            pipeline: [
              {
                $project: {
                  name: 1,
                  businessName: 1,
                  phone: 1,
                  isVerified: 1,
                  averageRating: 1,
                  totalReviews: 1,
                  address: 1
                }
              }
            ]
          }
        },
        { $unwind: '$supplier' },
        { $sort: sortOptions },
        { $skip: skip },
        { $limit: parseInt(limit) }
      ]);
    }

    const products = await productQuery;
    const total = await Product.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNext,
          hasPrev,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products'
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price.amount' }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          _id: 0
        }
      },
      { $sort: { category: 1 } }
    ]);

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: { categories }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true })
      .populate('supplier', 'name businessName phone isVerified averageRating totalReviews address');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product'
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product (suppliers only)
// @access  Private (Supplier only)
router.post('/', [
  authenticateToken,
  authorize('supplier'),
  requireVerifiedSupplier,
  validateProduct
], async (req, res) => {
  try {
    const productData = {
      ...req.body,
      supplier: req.user._id
    };

    const product = new Product(productData);
    await product.save();

    // Populate supplier info
    await product.populate('supplier', 'name businessName phone isVerified');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product (supplier only - own products)
// @access  Private (Supplier only)
router.put('/:id', [
  authenticateToken,
  authorize('supplier'),
  validateObjectId('id'),
  validateProduct
], async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      supplier: req.user._id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied'
      });
    }

    // Update product
    Object.assign(product, req.body);
    await product.save();

    // Populate supplier info
    await product.populate('supplier', 'name businessName phone isVerified');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (supplier only - own products)
// @access  Private (Supplier only)
router.delete('/:id', [
  authenticateToken,
  authorize('supplier'),
  validateObjectId('id')
], async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      supplier: req.user._id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied'
      });
    }

    // Soft delete - mark as inactive
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// @route   GET /api/products/supplier/my-products
// @desc    Get supplier's own products
// @access  Private (Supplier only)
router.get('/supplier/my-products', [
  authenticateToken,
  authorize('supplier'),
  validatePagination
], async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'active' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { supplier: req.user._id };
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get supplier products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products'
    });
  }
});

// @route   PATCH /api/products/:id/stock
// @desc    Update product stock (supplier only)
// @access  Private (Supplier only)
router.patch('/:id/stock', [
  authenticateToken,
  authorize('supplier'),
  validateObjectId('id')
], async (req, res) => {
  try {
    const { availableQuantity } = req.body;

    if (typeof availableQuantity !== 'number' || availableQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid available quantity is required'
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      supplier: req.user._id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied'
      });
    }

    product.availableQuantity = availableQuantity;
    await product.save();

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: { 
        product: {
          _id: product._id,
          name: product.name,
          availableQuantity: product.availableQuantity
        }
      }
    });

  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock'
    });
  }
});

module.exports = router;