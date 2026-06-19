/*
 * TargoBD — Configuration File
 * ==============================
 * এই ফাইলে আপনার API URL এবং অন্যান্য settings দিন।
 * Deploy করার সময় শুধু এই ফাইলটি পরিবর্তন করলেই হবে।
 */

const CONFIG = {
  // ─── API URL ───────────────────────────────────────────────
  // Local development:
  API_BASE: 'http://localhost:5000/api',

  // Production (আপনার server URL দিন):
  // API_BASE: 'https://api.targobd.com/api',
  // API_BASE: 'https://targobd-api.railway.app/api',
  // API_BASE: 'https://targobd-api.onrender.com/api',

  // ─── Site Settings ─────────────────────────────────────────
  SITE_NAME:    'TargoBD',
  SITE_TAGLINE: 'বাংলাদেশের সেরা অনলাইন শপিং',

  // ─── Free Shipping Threshold ───────────────────────────────
  FREE_SHIPPING_ABOVE: 500, // ৳৫০০ এর উপরে ফ্রি শিপিং

  // ─── Default Shipping Fee ──────────────────────────────────
  SHIPPING_FEE: 60, // ৳৬০

  // ─── Flash Sale End Time (hours from now) ──────────────────
  FLASH_SALE_HOURS: 6,

  // ─── Contact Info ──────────────────────────────────────────
  PHONE:    '01700-000000',
  EMAIL:    'info@targobd.com',
  FB_PAGE:  'https://facebook.com/targobd',
  WHATSAPP: 'https://wa.me/8801700000000',
};

// Override API_BASE from localStorage (for development switching)
if (typeof localStorage !== 'undefined' && localStorage.getItem('targo_api_override')) {
  CONFIG.API_BASE = localStorage.getItem('targo_api_override');
}

// Make available globally
if (typeof window !== 'undefined') window.CONFIG = CONFIG;
