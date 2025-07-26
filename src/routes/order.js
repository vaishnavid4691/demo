const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Vendor places order
router.post('/place', auth, role('vendor'), orderController.placeOrder);

// Supplier gets orders
router.get('/supplier', auth, role('supplier'), orderController.getSupplierOrders);

// Supplier updates order status
router.put('/:id/status', auth, role('supplier'), orderController.updateOrderStatus);

module.exports = router;