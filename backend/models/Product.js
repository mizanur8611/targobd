const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  nameEn:      { type: String, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  discount:    { type: Number, default: 0 }, // percent
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images:      [{ type: String }], // image URLs
  stock:       { type: Number, default: 0, min: 0 },
  sold:        { type: Number, default: 0 },
  badge:       { type: String, enum: ['HOT', 'NEW', 'SALE', ''], default: '' },
  isFlashSale: { type: Boolean, default: false },
  flashSaleEnd: { type: Date },
  isActive:    { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
  colors:      [{ name: String, code: String }],
  sizes:       [{ type: String }],
  weight:      { type: Number }, // grams
  sku:         { type: String, unique: true, sparse: true },
  tags:        [{ type: String }],
  ratings: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 }
  },
  deliveryNote: { type: String, default: 'ঢাকায় ১-২ দিন, সারাদেশে ২-৪ দিন' }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
