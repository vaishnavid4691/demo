const Order = require('../models/Order');
const Cart = require('../models/Cart');
const RawMaterial = require('../models/RawMaterial');

exports.placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ vendor: req.user._id }).populate('items.rawMaterial');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    // Group items by supplier
    const supplierItems = {};
    cart.items.forEach(item => {
      const supplierId = item.rawMaterial.supplier.toString();
      if (!supplierItems[supplierId]) supplierItems[supplierId] = [];
      supplierItems[supplierId].push({ rawMaterial: item.rawMaterial._id, quantity: item.quantity });
    });
    const orders = [];
    for (const supplierId in supplierItems) {
      const order = new Order({
        vendor: req.user._id,
        supplier: supplierId,
        items: supplierItems[supplierId],
        status: 'pending',
        notified: false,
      });
      await order.save();
      orders.push(order);
    }
    cart.items = [];
    await cart.save();
    res.status(201).json({ message: 'Order(s) placed', orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSupplierOrders = async (req, res) => {
  try {
    const orders = await Order.find({ supplier: req.user._id }).populate('vendor items.rawMaterial');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: id, supplier: req.user._id },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};