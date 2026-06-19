const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  color:    { type: String },
  size:     { type: String }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Customer info (for COD guest orders)
  customerName:  { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, default: '' },

  // Shipping address
  shippingAddress: {
    division: { type: String, required: true },
    district: { type: String, required: true },
    area:     { type: String, required: true },
    address:  { type: String, required: true }
  },

  items:       [orderItemSchema],
  subtotal:    { type: Number, required: true },
  shippingFee: { type: Number, default: 60 },
  discount:    { type: Number, default: 0 },
  total:       { type: Number, required: true },

  paymentMethod: { type: String, enum: ['COD', 'bKash', 'Nagad', 'Card'], default: 'COD' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentRef:    { type: String },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },

  statusHistory: [{
    status:  { type: String },
    note:    { type: String },
    date:    { type: Date, default: Date.now }
  }],

  trackingNumber: { type: String },
  courier:        { type: String },
  note:           { type: String },
  deliveredAt:    { type: Date }
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = 'TBD' + String(Date.now()).slice(-6) + String(count + 1).padStart(4, '0');
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
