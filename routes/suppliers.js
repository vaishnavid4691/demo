const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validatePagination, validateObjectId } = require('../middleware/validation');

// @route   GET /api/suppliers
// @desc    Get all verified suppliers with filtering
// @access  Public
router.get('/', validatePagination, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      verified = 'true',
      search,
      city,
      state,
      sortBy = 'averageRating',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { role: 'supplier', isActive: true };
    
    if (verified === 'true') {
      query.isVerified = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } }
      ];
    }

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (state) {
      query['address.state'] = { $regex: state, $options: 'i' };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const suppliers = await User.find(query)
      .select('-password -fssaiNumber')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      message: 'Suppliers retrieved successfully',
      data: {
        suppliers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalSuppliers: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve suppliers'
    });
  }
});

// @route   GET /api/suppliers/:id
// @desc    Get single supplier profile with products and reviews
// @access  Public
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const supplier = await User.findOne({
      _id: req.params.id,
      role: 'supplier',
      isActive: true
    }).select('-password -fssaiNumber');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Get supplier's products
    const products = await Product.find({
      supplier: req.params.id,
      isActive: true
    }).select('name description category price images averageRating totalReviews')
      .limit(10);

    // Get recent reviews
    const reviews = await Review.find({
      supplier: req.params.id,
      status: 'active'
    })
      .populate('vendor', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get detailed ratings
    const detailedRatings = await Review.getDetailedRatings(req.params.id);

    // Get product categories offered
    const categories = await Product.aggregate([
      { $match: { supplier: supplier._id, isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      message: 'Supplier profile retrieved successfully',
      data: {
        supplier,
        products,
        reviews,
        ratings: detailedRatings,
        categories: categories.map(cat => ({
          category: cat._id,
          productCount: cat.count
        })),
        stats: {
          totalProducts: await Product.countDocuments({
            supplier: req.params.id,
            isActive: true
          }),
          totalReviews: reviews.length
        }
      }
    });

  } catch (error) {
    console.error('Get supplier profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve supplier profile'
    });
  }
});

// @route   PATCH /api/suppliers/:id/verify
// @desc    Verify a supplier (Admin functionality - simplified for demo)
// @access  Private (Supplier can self-verify for demo, in production this would be admin-only)
router.patch('/:id/verify', [
  authenticateToken,
  validateObjectId('id')
], async (req, res) => {
  try {
    // In production, this would check for admin role
    // For demo purposes, allowing suppliers to self-verify
    const supplier = await User.findOne({
      _id: req.params.id,
      role: 'supplier'
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if current user is the supplier themselves or an admin
    if (req.user.role === 'supplier' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (supplier.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Supplier is already verified'
      });
    }

    // Verify FSSAI number format (basic validation)
    if (!supplier.fssaiNumber || !/^\d{14}$/.test(supplier.fssaiNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Valid FSSAI number is required for verification'
      });
    }

    // Mark as verified
    supplier.isVerified = true;
    await supplier.save();

    res.json({
      success: true,
      message: 'Supplier verified successfully',
      data: {
        supplier: {
          _id: supplier._id,
          name: supplier.name,
          businessName: supplier.businessName,
          isVerified: supplier.isVerified
        }
      }
    });

  } catch (error) {
    console.error('Verify supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify supplier'
    });
  }
});

// @route   GET /api/suppliers/search/nearby
// @desc    Search for nearby suppliers based on location
// @access  Public
router.get('/search/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusInKm = parseFloat(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(radiusInKm)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates or radius'
      });
    }

    // Find suppliers within radius (using MongoDB geospatial query)
    const suppliers = await User.find({
      role: 'supplier',
      isActive: true,
      isVerified: true,
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radiusInKm * 1000 // Convert km to meters
        }
      }
    })
      .select('-password -fssaiNumber')
      .limit(20);

    res.json({
      success: true,
      message: 'Nearby suppliers retrieved successfully',
      data: {
        suppliers,
        searchCenter: { latitude: lat, longitude: lng },
        radius: radiusInKm,
        count: suppliers.length
      }
    });

  } catch (error) {
    console.error('Search nearby suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search nearby suppliers'
    });
  }
});

// @route   GET /api/suppliers/analytics/dashboard
// @desc    Get supplier dashboard analytics
// @access  Private (Supplier only)
router.get('/analytics/dashboard', [
  authenticateToken,
  authorize('supplier')
], async (req, res) => {
  try {
    // Product analytics
    const totalProducts = await Product.countDocuments({
      supplier: req.user._id
    });

    const activeProducts = await Product.countDocuments({
      supplier: req.user._id,
      isActive: true
    });

    const lowStockProducts = await Product.countDocuments({
      supplier: req.user._id,
      isActive: true,
      availableQuantity: { $lt: 10 }
    });

    // Review analytics
    const reviewStats = await Review.getDetailedRatings(req.user._id);

    // Top performing products
    const topProducts = await Product.find({
      supplier: req.user._id,
      isActive: true
    })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(5)
      .select('name category averageRating totalReviews price');

    // Recent reviews
    const recentReviews = await Review.find({
      supplier: req.user._id,
      status: 'active'
    })
      .populate('vendor', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Category distribution
    const categoryStats = await Product.aggregate([
      { $match: { supplier: req.user._id, isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$averageRating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const analytics = {
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockProducts
      },
      reviews: reviewStats,
      topProducts,
      recentReviews,
      categories: categoryStats.map(cat => ({
        category: cat._id,
        productCount: cat.count,
        averageRating: Math.round((cat.avgRating || 0) * 10) / 10
      }))
    };

    res.json({
      success: true,
      message: 'Supplier analytics retrieved successfully',
      data: { analytics }
    });

  } catch (error) {
    console.error('Get supplier analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics'
    });
  }
});

// @route   GET /api/suppliers/categories/popular
// @desc    Get popular categories among verified suppliers
// @access  Public
router.get('/categories/popular', async (req, res) => {
  try {
    const popularCategories = await Product.aggregate([
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
          isActive: true,
          'supplierInfo.isVerified': true,
          'supplierInfo.isActive': true
        }
      },
      {
        $group: {
          _id: '$category',
          supplierCount: { $addToSet: '$supplier' },
          productCount: { $sum: 1 },
          avgPrice: { $avg: '$price.amount' }
        }
      },
      {
        $project: {
          category: '$_id',
          supplierCount: { $size: '$supplierCount' },
          productCount: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          _id: 0
        }
      },
      { $sort: { supplierCount: -1, productCount: -1 } }
    ]);

    res.json({
      success: true,
      message: 'Popular categories retrieved successfully',
      data: { categories: popularCategories }
    });

  } catch (error) {
    console.error('Get popular categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve popular categories'
    });
  }
});

// @route   GET /api/suppliers/profile/completion
// @desc    Get profile completion status for supplier
// @access  Private (Supplier only)
router.get('/profile/completion', [
  authenticateToken,
  authorize('supplier')
], async (req, res) => {
  try {
    const supplier = req.user;
    
    const completionChecks = {
      basicInfo: {
        completed: !!(supplier.name && supplier.email && supplier.phone),
        weight: 20
      },
      businessInfo: {
        completed: !!(supplier.businessName && supplier.fssaiNumber),
        weight: 25
      },
      address: {
        completed: !!(supplier.address && supplier.address.street && 
                     supplier.address.city && supplier.address.state && 
                     supplier.address.pincode),
        weight: 15
      },
      verification: {
        completed: supplier.isVerified,
        weight: 20
      },
      products: {
        completed: false,
        weight: 15
      },
      reviews: {
        completed: supplier.totalReviews > 0,
        weight: 5
      }
    };

    // Check if supplier has products
    const productCount = await Product.countDocuments({
      supplier: supplier._id,
      isActive: true
    });
    
    completionChecks.products.completed = productCount > 0;

    // Calculate completion percentage
    let totalWeight = 0;
    let completedWeight = 0;

    Object.values(completionChecks).forEach(check => {
      totalWeight += check.weight;
      if (check.completed) {
        completedWeight += check.weight;
      }
    });

    const completionPercentage = Math.round((completedWeight / totalWeight) * 100);

    // Get missing items
    const missingItems = Object.entries(completionChecks)
      .filter(([key, check]) => !check.completed)
      .map(([key, check]) => ({
        section: key,
        weight: check.weight
      }));

    res.json({
      success: true,
      message: 'Profile completion status retrieved successfully',
      data: {
        completionPercentage,
        completionChecks,
        missingItems,
        totalProducts: productCount,
        isVerified: supplier.isVerified
      }
    });

  } catch (error) {
    console.error('Get profile completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile completion status'
    });
  }
});

module.exports = router;