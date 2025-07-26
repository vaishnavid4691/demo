const RawMaterial = require('../models/RawMaterial');

exports.addRawMaterial = async (req, res) => {
  try {
    const { name, category, price, quantity, description } = req.body;
    const rawMaterial = new RawMaterial({
      name,
      category,
      price,
      quantity,
      description,
      supplier: req.user._id,
    });
    await rawMaterial.save();
    res.status(201).json(rawMaterial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const rawMaterial = await RawMaterial.findOneAndUpdate(
      { _id: id, supplier: req.user._id },
      req.body,
      { new: true }
    );
    if (!rawMaterial) return res.status(404).json({ message: 'Raw material not found' });
    res.json(rawMaterial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const rawMaterial = await RawMaterial.findOneAndDelete({ _id: id, supplier: req.user._id });
    if (!rawMaterial) return res.status(404).json({ message: 'Raw material not found' });
    res.json({ message: 'Raw material deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRawMaterials = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const materials = await RawMaterial.find(filter).populate('supplier', '-password');
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};