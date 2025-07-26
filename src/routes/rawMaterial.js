const express = require('express');
const router = express.Router();
const rawMaterialController = require('../controllers/rawMaterialController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Supplier routes
router.post('/', auth, role('supplier'), rawMaterialController.addRawMaterial);
router.put('/:id', auth, role('supplier'), rawMaterialController.updateRawMaterial);
router.delete('/:id', auth, role('supplier'), rawMaterialController.deleteRawMaterial);

// Vendor routes
router.get('/', auth, role('vendor'), rawMaterialController.getRawMaterials);

module.exports = router;