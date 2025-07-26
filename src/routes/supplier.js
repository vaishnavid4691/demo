const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Admin verifies supplier
router.post('/verify', auth, role('admin'), supplierController.verifySupplier);

// Vendors get verified suppliers
router.get('/verified', auth, role('vendor'), supplierController.getVerifiedSuppliers);

module.exports = router;