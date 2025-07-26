const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateOrder, validatePagination, validateObjectId } = require('../middleware/validation');

// @route   POST /api/orders
// @desc    Create order from cart
// @access  Private (Vendor only)
router.post('/', [
  authenticateToken,
  authorize('vendor'),
  validateOrder
], async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod, vendorNotes } = req.body;

    // Get vendor's cart
    const cart = await Cart.findOne({ vendor: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate cart items
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product?.name || 'unknown'} is no longer available`
        });
      }

      if (cartItem.quantity > product.availableQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.availableQuantity}`
        });
      }

      const itemTotal = cartItem.priceAtAdd.amount * cartItem.quantity;
      
      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: cartItem.quantity,
        unitPrice: cartItem.priceAtAdd,
        totalPrice: itemTotal,
        supplier: product.supplier,
        notes: cartItem.notes
      });

      totalAmount += itemTotal;

      // Update product stock
      product.availableQuantity -= cartItem.quantity;
      await product.save();
    }

    // Create order
    const order = new Order({
      vendor: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      vendorNotes,
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    });

    await order.save();

    // Clear cart after successful order
    await cart.clearCart();

    // Populate order details
    await order.populate([
      { path: 'vendor', select: 'name email phone address' },
      { path: 'items.product', select: 'name category images' },
      { path: 'items.supplier', select: 'name businessName phone email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// @route   GET /api/orders
// @desc    Get orders (vendor sees their orders, supplier sees orders for their products)
// @access  Private
router.get('/', [
  authenticateToken,
  validatePagination
], async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    let orders;

    if (req.user.role === 'vendor') {
      // Vendor sees their own orders
      query.vendor = req.user._id;
      if (status) query.status = status;

      orders = await Order.find(query)
        .populate([
          { path: 'items.product', select: 'name category images' },
          { path: 'items.supplier', select: 'name businessName phone' }
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    } else if (req.user.role === 'supplier') {
      // Supplier sees orders containing their products
      if (status) query.status = status;

      orders = await Order.find({
        'items.supplier': req.user._id,
        ...query
      })
        .populate([
          { path: 'vendor', select: 'name phone address vendorType' },
          { path: 'items.product', select: 'name category images' }
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Filter items to show only supplier's products
      orders = orders.map(order => {
        const filteredOrder = order.toObject();
        filteredOrder.items = filteredOrder.items.filter(
          item => item.supplier.toString() === req.user._id.toString()
        );
        return filteredOrder;
      });
    }

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details
// @access  Private
router.get('/:id', [
  authenticateToken,
  validateObjectId('id')
], async (req, res) => {
  try {
    let order = await Order.findById(req.params.id)
      .populate([
        { path: 'vendor', select: 'name email phone address vendorType' },
        { path: 'items.product', select: 'name description category images' },
        { path: 'items.supplier', select: 'name businessName phone email address' },
        { path: 'statusHistory.updatedBy', select: 'name businessName' }
      ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check access permissions
    const isVendor = req.user.role === 'vendor' && order.vendor._id.toString() === req.user._id.toString();
    const isSupplier = req.user.role === 'supplier' && order.items.some(
      item => item.supplier._id.toString() === req.user._id.toString()
    );

    if (!isVendor && !isSupplier) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If supplier, filter items to show only their products
    if (req.user.role === 'supplier') {
      order = order.toObject();
      order.items = order.items.filter(
        item => item.supplier._id.toString() === req.user._id.toString()
      );
    }

    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order'
    });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status (supplier only)
// @access  Private (Supplier only)
router.patch('/:id/status', [
  authenticateToken,
  authorize('supplier'),
  validateObjectId('id')
], async (req, res) => {
  try {
    const { status, notes } = req.body;

    const validStatuses = ['accepted', 'rejected', 'processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      'items.supplier': req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied'
      });
    }

    // Update order status
    await order.updateStatus(status, req.user._id, notes);

    // If rejected, restore product quantities
    if (status === 'rejected') {
      for (const item of order.items) {
        if (item.supplier.toString() === req.user._id.toString()) {
          const product = await Product.findById(item.product);
          if (product) {
            product.availableQuantity += item.quantity;
            await product.save();
          }
        }
      }
    }

    await order.populate([
      { path: 'vendor', select: 'name phone address' },
      { path: 'items.product', select: 'name category' },
      { path: 'items.supplier', select: 'name businessName phone' }
    ]);

    res.json({
      success: true,
      message: `Order ${status} successfully`,
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// @route   POST /api/orders/:id/accept
// @desc    Accept order (supplier only)
// @access  Private (Supplier only)
router.post('/:id/accept', [
  authenticateToken,
  authorize('supplier'),
  validateObjectId('id')
], async (req, res) => {
  try {
    const { notes } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      'items.supplier': req.user._id,
      status: 'pending'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found, already processed, or access denied'
      });
    }

    await order.acceptOrder(req.user._id, notes);

    res.json({
      success: true,
      message: 'Order accepted successfully',
      data: { 
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status
      }
    });

  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept order'
    });
  }
});

// @route   POST /api/orders/:id/reject
// @desc    Reject order (supplier only)
// @access  Private (Supplier only)
router.post('/:id/reject', [
  authenticateToken,
  authorize('supplier'),
  validateObjectId('id')
], async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      'items.supplier': req.user._id,
      status: 'pending'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found, already processed, or access denied'
      });
    }

    await order.rejectOrder(req.user._id, reason);

    // Restore product quantities for rejected items
    for (const item of order.items) {
      if (item.supplier.toString() === req.user._id.toString()) {
        const product = await Product.findById(item.product);
        if (product) {
          product.availableQuantity += item.quantity;
          await product.save();
        }
      }
    }

    res.json({
      success: true,
      message: 'Order rejected successfully',
      data: { 
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        rejectionReason: order.rejectionReason
      }
    });

  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject order'
    });
  }
});

// @route   GET /api/orders/analytics/dashboard
// @desc    Get order analytics for dashboard
// @access  Private
router.get('/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    let analytics = {};

    if (req.user.role === 'vendor') {
      // Vendor analytics
      const totalOrders = await Order.countDocuments({ vendor: req.user._id });
      const pendingOrders = await Order.countDocuments({ vendor: req.user._id, status: 'pending' });
      const completedOrders = await Order.countDocuments({ vendor: req.user._id, status: 'delivered' });
      
      const totalSpent = await Order.aggregate([
        { $match: { vendor: req.user._id, status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      analytics = {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent: totalSpent[0]?.total || 0,
        completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0
      };

    } else if (req.user.role === 'supplier') {
      // Supplier analytics
      const totalOrders = await Order.countDocuments({ 'items.supplier': req.user._id });
      const pendingOrders = await Order.countDocuments({ 'items.supplier': req.user._id, status: 'pending' });
      const acceptedOrders = await Order.countDocuments({ 'items.supplier': req.user._id, status: { $in: ['accepted', 'processing', 'shipped', 'delivered'] } });
      
      const revenue = await Order.aggregate([
        { $match: { 'items.supplier': req.user._id, status: 'delivered' } },
        { $unwind: '$items' },
        { $match: { 'items.supplier': req.user._id } },
        { $group: { _id: null, total: { $sum: '$items.totalPrice' } } }
      ]);

      analytics = {
        totalOrders,
        pendingOrders,
        acceptedOrders,
        totalRevenue: revenue[0]?.total || 0,
        acceptanceRate: totalOrders > 0 ? ((acceptedOrders / totalOrders) * 100).toFixed(1) : 0
      };
    }

    res.json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: { analytics }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics'
    });
  }
});

// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel order (vendor only, if pending)
// @access  Private (Vendor only)
router.patch('/:id/cancel', [
  authenticateToken,
  authorize('vendor'),
  validateObjectId('id')
], async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      vendor: req.user._id,
      status: 'pending'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found, already processed, or cannot be cancelled'
      });
    }

    // Restore product quantities
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.availableQuantity += item.quantity;
        await product.save();
      }
    }

    await order.updateStatus('cancelled', req.user._id, 'Cancelled by vendor');

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { 
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status
      }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
});

module.exports = router;