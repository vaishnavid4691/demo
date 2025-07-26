const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Vendor adds review
router.post('/add', auth, role('vendor'), reviewController.addReview);

// Anyone can get reviews for a supplier
router.get('/supplier/:supplierId', reviewController.getSupplierReviews);

module.exports = router;