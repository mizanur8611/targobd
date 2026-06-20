require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// Allow multiple frontend origins (custom domain + www + vercel.app fallback)
// You can add more origins here later, or set them via FRONTEND_URL as a
// comma-separated list in your .env, e.g.:
//   FRONTEND_URL=https://targobd.com,https://www.targobd.com,https://targobd.vercel.app
const defaultOrigins = [
  'https://targobd.com',
  'https://www.targobd.com',
  'https://targobd.vercel.app'
];

const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (e.g. server-to-server, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/reviews',    require('./routes/reviews'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/upload',     require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, app: 'TargoBD API', db: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.name === 'ValidationError') return res.status(400).json({ success: false, message: Object.values(err.errors).map(e=>e.message).join(', ') });
  if (err.code === 11000) return res.status(400).json({ success: false, message: 'এই তথ্য আগেই registered' });
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

// ─── MongoDB Connect ───────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/targobd')
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 TargoBD API running on port ${PORT}`));
  })
  .catch(err => { console.error('MongoDB Error:', err); process.exit(1); });
