const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  badge:    { type: String, default: '' },        // e.g. "🔥 MEGA SALE IS LIVE"
  title:    { type: String, required: true },      // can contain <br> and <span> for styling, e.g. "Smart Deals.<br><span>Smart Life.</span>"
  subtitle: { type: String, default: '' },
  image:    { type: String, required: true },      // background image URL for the banner
  buttonText: { type: String, default: 'Shop Now →' },
  link:     { type: String, default: '/pages/products.html' },
  order:    { type: Number, default: 0 },           // controls slide order, lower = first
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

bannerSchema.index({ order: 1, isActive: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
