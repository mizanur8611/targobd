const express  = require('express');
const router   = express.Router();
const upload   = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');
const path     = require('path');
const fs       = require('fs');

// POST /api/upload/product   — upload up to 6 product images
router.post('/product', protect, admin, (req, res, next) => {
  req.uploadFolder = 'products';
  next();
}, upload.array('images', 6), (req, res) => {
  if (!req.files?.length)
    return res.status(400).json({ success: false, message: 'কোনো ফাইল পাওয়া যায়নি' });
  const urls = req.files.map(f => '/uploads/products/' + f.filename);
  res.json({ success: true, urls });
});

// POST /api/upload/avatar   — upload user avatar
router.post('/avatar', protect, (req, res, next) => {
  req.uploadFolder = 'avatars';
  next();
}, upload.single('avatar'), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: 'কোনো ফাইল পাওয়া যায়নি' });
  const url = '/uploads/avatars/' + req.file.filename;
  const User = require('../models/User');
  await User.findByIdAndUpdate(req.user._id, { avatar: url });
  res.json({ success: true, url });
});

// DELETE /api/upload   — delete an image file (admin)
router.delete('/', protect, admin, (req, res) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ success: false, message: 'filePath দিন' });
  const fullPath = path.join(__dirname, '..', filePath.replace(/^\//, ''));
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    res.json({ success: true, message: 'ফাইল মুছে ফেলা হয়েছে' });
  } else {
    res.status(404).json({ success: false, message: 'ফাইল পাওয়া যায়নি' });
  }
});

module.exports = router;
