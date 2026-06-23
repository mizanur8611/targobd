// ─── banners.js ────────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { protect, admin } = require('../middleware/auth');

// GET /api/banners — public, returns only active banners, sorted by order
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, banners });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/banners/all — admin only, returns ALL banners (active + inactive) for the admin panel list
router.get('/all', protect, admin, async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, banners });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/banners — admin only, create a new banner
router.post('/', protect, admin, async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, banner });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/banners/:id — admin only, update a banner
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, banner });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/banners/:id — admin only, permanently delete a banner
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
