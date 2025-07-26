const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: [
      'vegetables',
      'fruits',
      'grains_cereals',
      'dairy',
      'meat_poultry',
      'seafood',
      'spices_herbs',
      'packaged_goods',
      'oils_fats',
      'beverages',
      'snacks',
      'other'
    ]
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'grams', 'liters', 'pieces', 'packets', 'boxes']
    }
  },
  minimumOrderQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    url: String,
    altText: String
  }],
  // Quality and safety information
  qualityGrade: {
    type: String,
    enum: ['A', 'B', 'C'],
    default: 'B'
  },
  harvestDate: Date,
  expiryDate: Date,
  storageInstructions: String,
  certifications: [{
    name: String,
    issuedBy: String,
    validUntil: Date
  }],
  // Location for local sourcing
  originLocation: {
    state: String,
    district: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  // Product status
  isActive: {
    type: Boolean,
    default: true
  },
  isInSeason: {
    type: Boolean,
    default: true
  },
  // Rating and reviews
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  // SEO and search
  tags: [String],
  searchKeywords: [String]
}, {
  timestamps: true
});

// Indexes for efficient querying
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ supplier: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ 'price.amount': 1 });
productSchema.index({ 'originLocation.coordinates': '2dsphere' });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.amount}/${this.price.unit}`;
});

// Pre-save middleware to update search keywords
productSchema.pre('save', function(next) {
  // Generate search keywords from name, description, and category
  const keywords = [
    ...this.name.toLowerCase().split(' '),
    ...this.description.toLowerCase().split(' '),
    this.category.toLowerCase(),
    ...this.tags.map(tag => tag.toLowerCase())
  ];
  
  // Remove duplicates and empty strings
  this.searchKeywords = [...new Set(keywords.filter(keyword => keyword.length > 0))];
  next();
});

module.exports = mongoose.model('Product', productSchema);