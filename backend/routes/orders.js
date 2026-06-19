const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin, optionalAuth } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const sendOrderEmail = async (order) => {
  if (!process.env.EMAIL_USER) return;
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({
      from: `TargoBD <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `🛒 নতুন অর্ডার #${order.orderNumber}`,
      html: `
        <h2>নতুন অর্ডার পাওয়া গেছে!</h2>
        <p><strong>অর্ডার নং:</strong> ${order.orderNumber}</p>
        <p><strong>কাস্টমার:</strong> ${order.customerName}</p>
        <p><strong>ফোন:</strong> ${order.customerPhone}</p>
        <p><strong>মোট:</strong> ৳${order.total}</p>
        <p><strong>পেমেন্ট:</strong> ${order.paymentMethod}</p>
        <p><strong>ঠিকানা:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.area}, ${order.shippingAddress.district}</p>
      `
    });
  } catch (e) { console.error('Email error:', e.message); }
};

// POST /api/orders  — place order (guest or logged in)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, shippingAddress, items, paymentMethod, note } = req.body;

    if (!customerName || !customerPhone || !shippingAddress || !items?.length)
      return res.status(400).json({ success: false, message: 'সব তথ্য দিন' });

    // Validate & calculate prices from DB
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive)
        return res.status(400).json({ success: false, message: `পণ্য পাওয়া যায়নি: ${item.product}` });
      if (product.stock < item.quantity)
        return res.status(400).json({ success: false, message: `${product.name} — স্টক নেই` });

      const price = product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        product: product._id,
        name:    product.name,
        image:   product.images[0] || '',
        price,
        quantity:item.quantity,
        color:   item.color || '',
        size:    item.size  || ''
      });
    }

    const shippingFee = subtotal >= 500 ? 0 : 60;
    const total = subtotal + shippingFee;

    const order = await Order.create({
      user:           req.user?._id || null,
      customerName,
      customerPhone,
      customerEmail:  customerEmail || '',
      shippingAddress,
      items:          orderItems,
      subtotal,
      shippingFee,
      total,
      paymentMethod:  paymentMethod || 'COD',
      note:           note || '',
      statusHistory:  [{ status: 'pending', note: 'অর্ডার পাওয়া গেছে' }]
    });

    // Deduct stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      });
    }

    await sendOrderEmail(order);

    res.status(201).json({ success: true, order: { orderNumber: order.orderNumber, total: order.total, status: order.status } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/track/:orderNumber  — public tracking
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.product', 'name images');
    if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/my  — user's orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders  — admin: all orders
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 30, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { customerPhone: { $regex: search, $options: 'i' } }
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('user', 'name phone'),
      Order.countDocuments(filter)
    ]);
    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/orders/:id/status  — admin: update status
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, note, trackingNumber, courier } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });

    order.status = status;
    order.statusHistory.push({ status, note: note || '' });
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courier) order.courier = courier;
    if (status === 'delivered') order.deliveredAt = new Date();

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
