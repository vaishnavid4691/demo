const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  rawMaterial: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
  quantity: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'delivered'], default: 'pending' },
  notified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);