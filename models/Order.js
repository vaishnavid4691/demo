const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String, // Store product name at time of order
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    amount: Number,
    unit: String
  },
  totalPrice: Number,
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  // Order totals
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalItems: {
    type: Number,
    default: 0
  },
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  // Delivery information
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'online', 'bank_transfer'],
    default: 'cash_on_delivery'
  },
  // Communication
  vendorNotes: String,
  supplierNotes: String,
  rejectionReason: String,
  // Tracking
  statusHistory: [{
    status: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  // Grouping orders by supplier
  supplierOrders: [{
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    items: [orderItemSchema],
    subtotal: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'processing', 'shipped', 'delivered'],
      default: 'pending'
    },
    supplierNotes: String
  }]
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `BZS${Date.now()}${(count + 1).toString().padStart(4, '0')}`;
  }
  
  // Calculate totals
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + (item.totalPrice || 0), 0);
  
  next();
});

// Add status to history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      updatedAt: new Date()
    });
  }
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    updatedBy,
    updatedAt: new Date(),
    notes
  });
  
  // Set delivery date if delivered
  if (newStatus === 'delivered') {
    this.actualDeliveryDate = new Date();
  }
  
  return this.save();
};

// Method to accept order (for suppliers)
orderSchema.methods.acceptOrder = function(supplierId, notes = '') {
  return this.updateStatus('accepted', supplierId, notes);
};

// Method to reject order (for suppliers)
orderSchema.methods.rejectOrder = function(supplierId, reason) {
  this.rejectionReason = reason;
  return this.updateStatus('rejected', supplierId, reason);
};

// Static method to get orders by supplier
orderSchema.statics.getOrdersBySupplier = function(supplierId) {
  return this.find({
    'items.supplier': supplierId
  }).populate('vendor', 'name email phone address');
};

// Static method to get orders by vendor
orderSchema.statics.getOrdersByVendor = function(vendorId) {
  return this.find({ vendor: vendorId })
    .populate('items.product', 'name category')
    .populate('items.supplier', 'name businessName phone');
};

module.exports = mongoose.model('Order', orderSchema);