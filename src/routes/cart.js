const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('vendor'), cartController.getCart);
router.post('/add', auth, role('vendor'), cartController.addToCart);
router.put('/update', auth, role('vendor'), cartController.updateCartItem);
router.delete('/remove', auth, role('vendor'), cartController.removeCartItem);

module.exports = router;