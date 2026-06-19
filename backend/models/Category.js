const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  nameEn:      { type: String, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  icon:        { type: String, default: '📦' },
  image:       { type: String, default: '' },
  description: { type: String, default: '' },
  parent:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
