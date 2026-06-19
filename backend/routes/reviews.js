const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

// POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { product: productId, rating, title, comment, orderId } = req.body;

    const exists = await Review.findOne({ product: productId, user: req.user._id });
    if (exists) return res.status(400).json({ success: false, message: 'আপনি আগেই রিভিউ দিয়েছেন' });

    // check verified purchase
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({ _id: orderId, user: req.user._id, status: 'delivered' });
      if (order) isVerifiedPurchase = true;
    }

    const review = await Review.create({
      product: productId, user: req.user._id, order: orderId || null,
      rating, title, comment, isVerifiedPurchase
    });

    // Update product ratings
    const reviews = await Review.find({ product: productId, isApproved: true });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(avg * 10) / 10,
      'ratings.count': reviews.length
    });

    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reviews/product/:productId
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar').sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reviews  — admin: all reviews
router.get('/', protect, admin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name').populate('user', 'name').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/reviews/:id/approve  — admin
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved }, { new: true });
    res.json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
