// TargoBD — Shared Header & Footer renderer

const CATEGORIES_CACHE_KEY = 'targo_categories';

async function getCategories() {
  const cached = sessionStorage.getItem(CATEGORIES_CACHE_KEY);
  if (cached) return JSON.parse(cached);
  const data = await api.get('/categories');
  if (data.success) sessionStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(data.categories));
  return data.categories || [];
}

function renderHeader() {
  const header = document.getElementById('app-header');
  if (!header) return;
  header.innerHTML = `
    <div class="announce-bar">
      🎉 ৳৫০০+ অর্ডারে <span>ফ্রি ডেলিভারি</span> | আজই অর্ডার করুন, কাল পান | COD সুবিধা সারাদেশে 🚚
    </div>
    <header class="header">
      <div class="container header-inner">
        <a href="/index.html" class="logo">
          <div class="logo-text">Targo<span>BD</span></div>
          <div class="logo-sub">Smart Shopping</div>
        </a>
        <div class="search-wrap">
          <select class="search-cat" id="search-cat">
            <option value="">সব ক্যাটাগরি</option>
          </select>
          <input class="search-input" id="search-input" placeholder="পণ্য খুঁজুন..." type="text">
          <button class="search-btn" onclick="doSearch()">🔍</button>
        </div>
        <div class="header-actions">
          <a href="/pages/cart.html" class="hbtn">
            <span class="hbtn-icon">🛒</span>
            <span>কার্ট</span>
            <span class="cart-badge">0</span>
          </a>
          <a href="/pages/wishlist.html" class="hbtn">
            <span class="hbtn-icon">❤️</span>
            <span>উইশলিস্ট</span>
          </a>
          <a href="/pages/login.html" class="hbtn btn-login">
            <span class="hbtn-icon">👤</span>
            <span>লগইন</span>
          </a>
          <div class="hbtn user-menu" style="display:none;position:relative" onclick="toggleUserDropdown()">
            <span class="hbtn-icon">👤</span>
            <span class="user-name">আমি</span>
            <div id="user-dropdown" style="display:none;position:absolute;top:100%;right:0;background:#fff;border:1px solid var(--border);border-radius:8px;min-width:160px;box-shadow:var(--shadow-md);z-index:200;margin-top:4px;">
              <a href="/pages/account.html" style="display:block;padding:10px 14px;font-size:12px;color:var(--text2);border-bottom:1px solid var(--border);">👤 আমার অ্যাকাউন্ট</a>
              <a href="/pages/orders.html" style="display:block;padding:10px 14px;font-size:12px;color:var(--text2);border-bottom:1px solid var(--border);">📦 আমার অর্ডার</a>
              <div onclick="Auth.logout()" style="padding:10px 14px;font-size:12px;color:var(--primary);cursor:pointer;font-weight:600;">🚪 লগআউট</div>
            </div>
          </div>
        </div>
      </div>
    </header>
    <nav class="nav">
      <div class="container nav-inner" id="main-nav">
        <a href="/index.html" class="nav-item">🏠 হোম</a>
        <a href="/pages/products.html?flash=true" class="nav-item flash">⚡ ফ্ল্যাশ সেল</a>
        <a href="/pages/products.html" class="nav-item">🛍️ সব পণ্য</a>
      </div>
    </nav>
  `;

  // Load categories into nav and search select
  getCategories().then(cats => {
    const nav = document.getElementById('main-nav');
    const sel = document.getElementById('search-cat');
    cats.forEach(c => {
      const a = document.createElement('a');
      a.className = 'nav-item';
      a.href = `/pages/products.html?category=${c._id}`;
      a.textContent = `${c.icon} ${c.name}`;
      nav.appendChild(a);

      const opt = document.createElement('option');
      opt.value = c._id;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  });

  // Search Enter key
  document.getElementById('search-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });

  updateAuthUI();
}

function toggleUserDropdown() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}
document.addEventListener('click', e => {
  if (!e.target.closest('.user-menu')) {
    const dd = document.getElementById('user-dropdown');
    if (dd) dd.style.display = 'none';
  }
});

function doSearch() {
  const q = document.getElementById('search-input')?.value?.trim();
  const cat = document.getElementById('search-cat')?.value;
  let url = '/pages/products.html?';
  if (q) url += `search=${encodeURIComponent(q)}&`;
  if (cat) url += `category=${cat}&`;
  window.location.href = url;
}

function renderFooter() {
  const footer = document.getElementById('app-footer');
  if (!footer) return;
  footer.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="footer-brand-text">Targo<span>BD</span></div>
            <p class="footer-brand-desc">বাংলাদেশের সবচেয়ে বিশ্বস্ত হাইব্রিড ই-কমার্স প্ল্যাটফর্ম। COD সুবিধায় কেনাকাটা করুন, নিরাপদ থাকুন।</p>
          </div>
          <div>
            <div class="footer-col-title">কোম্পানি</div>
            <a class="footer-link" href="#">আমাদের সম্পর্কে</a>
            <a class="footer-link" href="#">ক্যারিয়ার</a>
            <a class="footer-link" href="#">ব্লগ</a>
            <a class="footer-link" href="#">যোগাযোগ</a>
          </div>
          <div>
            <div class="footer-col-title">সহায়তা</div>
            <a class="footer-link" href="/pages/track.html">অর্ডার ট্র্যাক করুন</a>
            <a class="footer-link" href="#">রিটার্ন পলিসি</a>
            <a class="footer-link" href="#">FAQ</a>
            <a class="footer-link" href="#">লাইভ চ্যাট</a>
          </div>
          <div>
            <div class="footer-col-title">সেলার হোন</div>
            <a class="footer-link" href="#">Vendor Registration</a>
            <a class="footer-link" href="#">সেলার গাইড</a>
            <a class="footer-link" href="#">কমিশন সিস্টেম</a>
          </div>
        </div>
        <hr class="footer-divider">
        <div class="footer-bottom">
          <div class="footer-copy">© ২০২৬ TargoBD. সকল স্বত্ব সংরক্ষিত। Made with ❤️ in Bangladesh</div>
          <div class="payment-icons">
            <div class="payment-icon bkash">bKash</div>
            <div class="payment-icon nagad">Nagad</div>
            <div class="payment-icon">VISA</div>
            <div class="payment-icon">MasterCard</div>
            <div class="payment-icon cod">💵 COD</div>
          </div>
        </div>
      </div>
    </footer>
  `;
}

// Render on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
});
