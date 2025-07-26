const mongoose = require('mongoose');

const RawMaterialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Vegetables', 'Fruits', 'Packaged', 'Dairy', 'Grains', 'Other'], required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('RawMaterial', RawMaterialSchema);