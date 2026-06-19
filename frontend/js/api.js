// TargoBD API Client — URL comes from config.js
const API_BASE = (typeof CONFIG !== 'undefined' ? CONFIG.API_BASE : null) || 'http://localhost:5000/api';

const api = {
  base: API_BASE,

  headers() {
    const token = localStorage.getItem('targo_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  },

  async get(path) {
    const res = await fetch(this.base + path, { headers: this.headers() });
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(this.base + path, {
      method: 'POST', headers: this.headers(), body: JSON.stringify(body)
    });
    return res.json();
  },

  async put(path, body) {
    const res = await fetch(this.base + path, {
      method: 'PUT', headers: this.headers(), body: JSON.stringify(body)
    });
    return res.json();
  },

  async delete(path) {
    const res = await fetch(this.base + path, { method: 'DELETE', headers: this.headers() });
    return res.json();
  },

  async postForm(path, formData) {
    const token = localStorage.getItem('targo_token');
    const res = await fetch(this.base + path, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    return res.json();
  }
};

// ─── Cart Manager ──────────────────────────────────────────────────────────────
const Cart = {
  get() { return JSON.parse(localStorage.getItem('targo_cart') || '[]'); },
  save(cart) { localStorage.setItem('targo_cart', JSON.stringify(cart)); this.updateBadge(); },

  add(product, qty = 1, color = '', size = '') {
    const cart = this.get();
    const existing = cart.find(i => i.product === product._id && i.color === color && i.size === size);
    if (existing) existing.quantity += qty;
    else cart.push({ product: product._id, name: product.name, image: product.images?.[0] || '', price: product.price, quantity: qty, color, size });
    this.save(cart);
    showToast('✅ কার্টে যোগ হয়েছে');
  },

  remove(index) { const c = this.get(); c.splice(index, 1); this.save(c); },
  updateQty(index, qty) { const c = this.get(); if (qty < 1) { this.remove(index); return; } c[index].quantity = qty; this.save(c); },
  clear() { localStorage.removeItem('targo_cart'); this.updateBadge(); },

  total() { return this.get().reduce((s, i) => s + i.price * i.quantity, 0); },
  count() { return this.get().reduce((s, i) => s + i.quantity, 0); },

  updateBadge() {
    const b = document.querySelector('.cart-badge');
    if (b) { const c = this.count(); b.textContent = c; b.style.display = c ? 'flex' : 'none'; }
  }
};

// ─── Auth Manager ─────────────────────────────────────────────────────────────
const Auth = {
  getToken() { return localStorage.getItem('targo_token'); },
  getUser()  { try { return JSON.parse(localStorage.getItem('targo_user')); } catch { return null; } },
  isLoggedIn() { return !!this.getToken(); },

  async login(emailOrPhone, password) {
    const data = await api.post('/auth/login', { emailOrPhone, password });
    if (data.success) {
      localStorage.setItem('targo_token', data.token);
      localStorage.setItem('targo_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(name, emailOrPhone, password) {
    const isPhone = /^01/.test(emailOrPhone);
    const body = { name, password, ...(isPhone ? { phone: emailOrPhone } : { email: emailOrPhone }) };
    const data = await api.post('/auth/register', body);
    if (data.success) {
      localStorage.setItem('targo_token', data.token);
      localStorage.setItem('targo_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('targo_token');
    localStorage.removeItem('targo_user');
    window.location.href = '/index.html';
  }
};

// ─── Utilities ────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = `position:fixed;bottom:20px;right:20px;z-index:9999;padding:12px 20px;border-radius:8px;
      font-family:'Hind Siliguri',sans-serif;font-size:13px;font-weight:600;max-width:300px;
      box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:.3s;opacity:0;transform:translateY(10px)`;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = type === 'error' ? '#E8190A' : type === 'info' ? '#0066FF' : '#00B96B';
  t.style.color = '#fff';
  t.style.opacity = '1';
  t.style.transform = 'translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; }, 3000);
}

function formatPrice(n) {
  return '৳' + Number(n).toLocaleString('bn-BD');
}

function getProductImageUrl(img) {
  if (!img) return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23f5f5f7"/><text y="50%" x="50%" text-anchor="middle" font-size="40">📦</text></svg>';
  if (img.startsWith('http')) return img;
  return API_BASE.replace('/api', '') + img;
}

function getParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

// Update auth UI
function updateAuthUI() {
  const user = Auth.getUser();
  const loginBtn = document.querySelector('.btn-login');
  const userMenu = document.querySelector('.user-menu');
  const userName = document.querySelector('.user-name');

  if (user && loginBtn) { loginBtn.style.display = 'none'; if (userMenu) userMenu.style.display = 'flex'; if (userName) userName.textContent = user.name; }
  Cart.updateBadge();
}

document.addEventListener('DOMContentLoaded', updateAuthUI);
