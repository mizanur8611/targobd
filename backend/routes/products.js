const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const { protect, admin, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/products';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('শুধু image file আপলোড করুন'));
  }
});

// GET /api/products  — list with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice, badge, isFlashSale, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (category)    filter.category = category;
    if (badge)       filter.badge = badge;
    if (isFlashSale) filter.isFlashSale = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const sortMap = {
      newest:    { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc:{ price: -1 },
      popular:   { sold: -1 },
      rating:    { 'ratings.average': -1 }
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug icon').sort(sortObj).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/flash-sale
router.get('/flash-sale', async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true, isFlashSale: true,
      $or: [{ flashSaleEnd: { $gt: new Date() } }, { flashSaleEnd: null }]
    }).populate('category', 'name slug').limit(10);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug').limit(10);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug icon');
    if (!product || !product.isActive)
      return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি' });

    const reviews = await Review.find({ product: product._id, isApproved: true })
      .populate('user', 'name avatar').sort({ createdAt: -1 }).limit(20);

    // related products
    const related = await Product.find({
      category: product.category._id, isActive: true, _id: { $ne: product._id }
    }).limit(6);

    res.json({ success: true, product, reviews, related });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products  — admin only
router.post('/', protect, admin, upload.array('images', 6), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    if (req.files?.length) {
      data.images = req.files.map(f => '/uploads/products/' + f.filename);
    }
    const product = await Product.create(data);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id  — admin only
router.put('/:id', protect, admin, upload.array('images', 6), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    if (req.files?.length) {
      data.images = req.files.map(f => '/uploads/products/' + f.filename);
    }
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id  — admin only (soft delete)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'পণ্য মুছে ফেলা হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
