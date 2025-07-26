const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateReview, validatePagination, validateObjectId } = require('../middleware/validation');

// @route   POST /api/reviews
// @desc    Create a review for a supplier
// @access  Private (Vendor only)
router.post('/', [
  authenticateToken,
  authorize('vendor'),
  validateReview
], async (req, res) => {
  try {
    const { 
      supplierId, 
      orderId, 
      productId, 
      rating, 
      comment,
      qualityRating,
      deliveryRating,
      communicationRating,
      valueForMoneyRating
    } = req.body;

    // Verify that the order exists and belongs to the vendor
    const order = await Order.findOne({
      _id: orderId,
      vendor: req.user._id,
      status: 'delivered'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not eligible for review (must be delivered)'
      });
    }

    // Verify that the supplier is part of this order
    const hasSupplierInOrder = order.items.some(
      item => item.supplier.toString() === supplierId
    );

    if (!hasSupplierInOrder) {
      return res.status(400).json({
        success: false,
        message: 'Supplier was not part of this order'
      });
    }

    // Check if review already exists for this vendor-supplier-order combination
    const existingReview = await Review.findOne({
      vendor: req.user._id,
      supplier: supplierId,
      order: orderId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this order and supplier'
      });
    }

    // Verify supplier exists
    const supplier = await User.findOne({ _id: supplierId, role: 'supplier' });
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Create review
    const review = new Review({
      vendor: req.user._id,
      supplier: supplierId,
      order: orderId,
      product: productId,
      rating,
      comment,
      qualityRating,
      deliveryRating,
      communicationRating,
      valueForMoneyRating,
      isVerifiedPurchase: true
    });

    await review.save();

    // Populate review details
    await review.populate([
      { path: 'vendor', select: 'name vendorType' },
      { path: 'supplier', select: 'name businessName' },
      { path: 'product', select: 'name category' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });

  } catch (error) {
    console.error('Create review error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this order and supplier'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create review'
    });
  }
});

// @route   GET /api/reviews/supplier/:supplierId
// @desc    Get reviews for a specific supplier
// @access  Public
router.get('/supplier/:supplierId', [
  validateObjectId('supplierId'),
  validatePagination
], async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const reviews = await Review.getSupplierReviews(
      req.params.supplierId, 
      parseInt(page), 
      parseInt(limit)
    );

    // Get detailed ratings
    const detailedRatings = await Review.getDetailedRatings(req.params.supplierId);

    // Get total count for pagination
    const total = await Review.countDocuments({ 
      supplier: req.params.supplierId, 
      status: 'active' 
    });

    res.json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: {
        reviews,
        ratings: detailedRatings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get supplier reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews'
    });
  }
});

// @route   GET /api/reviews/vendor/my-reviews
// @desc    Get reviews created by the current vendor
// @access  Private (Vendor only)
router.get('/vendor/my-reviews', [
  authenticateToken,
  authorize('vendor'),
  validatePagination
], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ vendor: req.user._id })
      .populate([
        { path: 'supplier', select: 'name businessName averageRating' },
        { path: 'product', select: 'name category' },
        { path: 'order', select: 'orderNumber createdAt' }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ vendor: req.user._id });

    res.json({
      success: true,
      message: 'Your reviews retrieved successfully',
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get vendor reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your reviews'
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review (vendor only - own reviews)
// @access  Private (Vendor only)
router.put('/:id', [
  authenticateToken,
  authorize('vendor'),
  validateObjectId('id'),
  validateReview
], async (req, res) => {
  try {
    const { 
      rating, 
      comment,
      qualityRating,
      deliveryRating,
      communicationRating,
      valueForMoneyRating
    } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      vendor: req.user._id,
      status: 'active'
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or access denied'
      });
    }

    // Update review fields
    review.rating = rating;
    review.comment = comment;
    if (qualityRating) review.qualityRating = qualityRating;
    if (deliveryRating) review.deliveryRating = deliveryRating;
    if (communicationRating) review.communicationRating = communicationRating;
    if (valueForMoneyRating) review.valueForMoneyRating = valueForMoneyRating;

    await review.save();

    // Populate updated review
    await review.populate([
      { path: 'supplier', select: 'name businessName' },
      { path: 'product', select: 'name category' }
    ]);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review (vendor only - own reviews)
// @access  Private (Vendor only)
router.delete('/:id', [
  authenticateToken,
  authorize('vendor'),
  validateObjectId('id')
], async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      vendor: req.user._id,
      status: 'active'
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or access denied'
      });
    }

    // Soft delete
    review.status = 'deleted';
    await review.save();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

// @route   POST /api/reviews/:id/response
// @desc    Add supplier response to a review
// @access  Private (Supplier only)
router.post('/:id/response', [
  authenticateToken,
  authorize('supplier'),
  validateObjectId('id')
], async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response comment is required'
      });
    }

    const review = await Review.findOne({
      _id: req.params.id,
      supplier: req.user._id,
      status: 'active'
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or access denied'
      });
    }

    if (review.supplierResponse.comment) {
      return res.status(400).json({
        success: false,
        message: 'Response already exists for this review'
      });
    }

    await review.addSupplierResponse(comment.trim());

    res.json({
      success: true,
      message: 'Response added successfully',
      data: { 
        review: {
          _id: review._id,
          supplierResponse: review.supplierResponse
        }
      }
    });

  } catch (error) {
    console.error('Add supplier response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response'
    });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', [
  authenticateToken,
  validateObjectId('id')
], async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      status: 'active'
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.markHelpful();

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: { 
        helpfulVotes: review.helpfulVotes
      }
    });

  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful'
    });
  }
});

// @route   POST /api/reviews/:id/report
// @desc    Report a review
// @access  Private
router.post('/:id/report', [
  authenticateToken,
  validateObjectId('id')
], async (req, res) => {
  try {
    const { reason } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      status: 'active'
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.reportReview();

    res.json({
      success: true,
      message: 'Review reported successfully'
    });

  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report review'
    });
  }
});

// @route   GET /api/reviews/analytics/summary
// @desc    Get review analytics summary
// @access  Private
router.get('/analytics/summary', authenticateToken, async (req, res) => {
  try {
    let analytics = {};

    if (req.user.role === 'vendor') {
      // Vendor analytics
      const totalReviews = await Review.countDocuments({ vendor: req.user._id });
      const avgRatingGiven = await Review.aggregate([
        { $match: { vendor: req.user._id, status: 'active' } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);

      analytics = {
        totalReviewsGiven: totalReviews,
        averageRatingGiven: avgRatingGiven[0]?.avgRating ? 
          Math.round(avgRatingGiven[0].avgRating * 10) / 10 : 0
      };

    } else if (req.user.role === 'supplier') {
      // Supplier analytics
      const totalReviews = await Review.countDocuments({ 
        supplier: req.user._id, 
        status: 'active' 
      });
      
      const detailedRatings = await Review.getDetailedRatings(req.user._id);
      
      const recentReviews = await Review.find({ 
        supplier: req.user._id, 
        status: 'active' 
      })
        .populate('vendor', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

      analytics = {
        totalReviewsReceived: totalReviews,
        ratings: detailedRatings,
        recentReviews
      };
    }

    res.json({
      success: true,
      message: 'Review analytics retrieved successfully',
      data: { analytics }
    });

  } catch (error) {
    console.error('Get review analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve review analytics'
    });
  }
});

// @route   GET /api/reviews/pending
// @desc    Get pending reviews for vendor (orders that can be reviewed)
// @access  Private (Vendor only)
router.get('/pending', [
  authenticateToken,
  authorize('vendor')
], async (req, res) => {
  try {
    // Find delivered orders that haven't been reviewed yet
    const deliveredOrders = await Order.find({
      vendor: req.user._id,
      status: 'delivered'
    }).populate('items.supplier', 'name businessName');

    const pendingReviews = [];

    for (const order of deliveredOrders) {
      // Group items by supplier
      const supplierGroups = {};
      
      order.items.forEach(item => {
        const supplierId = item.supplier._id.toString();
        
        if (!supplierGroups[supplierId]) {
          supplierGroups[supplierId] = {
            supplier: item.supplier,
            items: [],
            hasReview: false
          };
        }
        
        supplierGroups[supplierId].items.push(item);
      });

      // Check which suppliers haven't been reviewed for this order
      for (const [supplierId, group] of Object.entries(supplierGroups)) {
        const existingReview = await Review.findOne({
          vendor: req.user._id,
          supplier: supplierId,
          order: order._id
        });

        if (!existingReview) {
          pendingReviews.push({
            order: {
              _id: order._id,
              orderNumber: order.orderNumber,
              createdAt: order.createdAt,
              actualDeliveryDate: order.actualDeliveryDate
            },
            supplier: group.supplier,
            items: group.items
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Pending reviews retrieved successfully',
      data: { 
        pendingReviews,
        count: pendingReviews.length
      }
    });

  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending reviews'
    });
  }
});

module.exports = router;