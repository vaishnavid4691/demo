const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['vendor', 'supplier'],
    required: true
  },
  // Address information
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  // Supplier specific fields
  businessName: {
    type: String,
    required: function() { return this.role === 'supplier'; }
  },
  fssaiNumber: {
    type: String,
    required: function() { return this.role === 'supplier'; },
    validate: {
      validator: function(v) {
        if (this.role !== 'supplier') return true;
        // FSSAI number validation: 14 digits
        return /^\d{14}$/.test(v);
      },
      message: 'FSSAI number must be exactly 14 digits'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Vendor specific fields
  vendorType: {
    type: String,
    enum: ['street_food', 'restaurant', 'cafe', 'catering'],
    required: function() { return this.role === 'vendor'; }
  },
  // Rating and review stats
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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for location-based queries
userSchema.index({ "address.coordinates": "2dsphere" });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Hide password when converting to JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);