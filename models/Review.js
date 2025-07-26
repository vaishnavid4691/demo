const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  // Rating (1-5 stars)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // Review text
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  // Detailed ratings
  qualityRating: {
    type: Number,
    min: 1,
    max: 5
  },
  deliveryRating: {
    type: Number,
    min: 1,
    max: 5
  },
  communicationRating: {
    type: Number,
    min: 1,
    max: 5
  },
  valueForMoneyRating: {
    type: Number,
    min: 1,
    max: 5
  },
  // Review metadata
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  isReported: {
    type: Boolean,
    default: false
  },
  // Supplier response
  supplierResponse: {
    comment: String,
    respondedAt: Date
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per vendor-supplier-order combination
reviewSchema.index({ vendor: 1, supplier: 1, order: 1 }, { unique: true });

// Index for efficient querying
reviewSchema.index({ supplier: 1, status: 1 });
reviewSchema.index({ vendor: 1 });
reviewSchema.index({ rating: 1 });

// Update supplier's average rating when review is saved
reviewSchema.post('save', async function() {
  const User = mongoose.model('User');
  
  // Calculate new average rating for supplier
  const reviews = await mongoose.model('Review').find({
    supplier: this.supplier,
    status: 'active'
  });
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    await User.findByIdAndUpdate(this.supplier, {
      averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviews.length
    });
  }
});

// Update supplier's average rating when review is removed
reviewSchema.post('remove', async function() {
  const User = mongoose.model('User');
  
  // Calculate new average rating for supplier
  const reviews = await mongoose.model('Review').find({
    supplier: this.supplier,
    status: 'active'
  });
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    await User.findByIdAndUpdate(this.supplier, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length
    });
  } else {
    await User.findByIdAndUpdate(this.supplier, {
      averageRating: 0,
      totalReviews: 0
    });
  }
});

// Method to add supplier response
reviewSchema.methods.addSupplierResponse = function(comment) {
  this.supplierResponse = {
    comment,
    respondedAt: new Date()
  };
  return this.save();
};

// Method to mark as helpful
reviewSchema.methods.markHelpful = function() {
  this.helpfulVotes += 1;
  return this.save();
};

// Method to report review
reviewSchema.methods.reportReview = function() {
  this.reportCount += 1;
  if (this.reportCount >= 5) {
    this.isReported = true;
    this.status = 'hidden';
  }
  return this.save();
};

// Static method to get reviews for a supplier
reviewSchema.statics.getSupplierReviews = function(supplierId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ supplier: supplierId, status: 'active' })
    .populate('vendor', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get average ratings by category
reviewSchema.statics.getDetailedRatings = async function(supplierId) {
  const reviews = await this.find({ supplier: supplierId, status: 'active' });
  
  if (reviews.length === 0) {
    return {
      overall: 0,
      quality: 0,
      delivery: 0,
      communication: 0,
      valueForMoney: 0,
      totalReviews: 0
    };
  }
  
  const totals = reviews.reduce((acc, review) => {
    acc.overall += review.rating;
    acc.quality += review.qualityRating || review.rating;
    acc.delivery += review.deliveryRating || review.rating;
    acc.communication += review.communicationRating || review.rating;
    acc.valueForMoney += review.valueForMoneyRating || review.rating;
    return acc;
  }, { overall: 0, quality: 0, delivery: 0, communication: 0, valueForMoney: 0 });
  
  const count = reviews.length;
  
  return {
    overall: Math.round((totals.overall / count) * 10) / 10,
    quality: Math.round((totals.quality / count) * 10) / 10,
    delivery: Math.round((totals.delivery / count) * 10) / 10,
    communication: Math.round((totals.communication / count) * 10) / 10,
    valueForMoney: Math.round((totals.valueForMoney / count) * 10) / 10,
    totalReviews: count
  };
};

module.exports = mongoose.model('Review', reviewSchema);