const User = require('../models/User');

exports.verifySupplier = async (req, res) => {
  try {
    const { supplierId } = req.body;
    const supplier = await User.findById(supplierId);
    if (!supplier || supplier.role !== 'supplier') {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    supplier.isVerified = true;
    await supplier.save();
    res.json({ message: 'Supplier verified', supplier });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getVerifiedSuppliers = async (req, res) => {
  try {
    const suppliers = await User.find({ role: 'supplier', isVerified: true }).select('-password');
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};