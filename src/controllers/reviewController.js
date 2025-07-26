const Review = require('../models/Review');

exports.addReview = async (req, res) => {
  try {
    const { supplierId, rating, comment } = req.body;
    const review = new Review({
      vendor: req.user._id,
      supplier: supplierId,
      rating,
      comment,
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSupplierReviews = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const reviews = await Review.find({ supplier: supplierId }).populate('vendor', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};