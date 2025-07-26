const Cart = require('../models/Cart');
const RawMaterial = require('../models/RawMaterial');

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ vendor: req.user._id }).populate('items.rawMaterial');
    if (!cart) cart = await Cart.create({ vendor: req.user._id, items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { rawMaterialId, quantity } = req.body;
    let cart = await Cart.findOne({ vendor: req.user._id });
    if (!cart) cart = await Cart.create({ vendor: req.user._id, items: [] });
    const itemIndex = cart.items.findIndex(item => item.rawMaterial.toString() === rawMaterialId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ rawMaterial: rawMaterialId, quantity });
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { rawMaterialId, quantity } = req.body;
    let cart = await Cart.findOne({ vendor: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.find(item => item.rawMaterial.toString() === rawMaterialId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });
    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { rawMaterialId } = req.body;
    let cart = await Cart.findOne({ vendor: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(item => item.rawMaterial.toString() !== rawMaterialId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};