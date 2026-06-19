// TargoBD — Shared Nav & Utilities
const API_BASE = 'http://localhost:5000/api';

const api = {
  headers(){const t=localStorage.getItem('targo_token');return{'Content-Type':'application/json',...(t?{Authorization:`Bearer ${t}`}:{})};},
  async get(p){try{const r=await fetch(API_BASE+p,{headers:this.headers()});return r.json();}catch{return{success:false};}},
  async post(p,b){try{const r=await fetch(API_BASE+p,{method:'POST',headers:this.headers(),body:JSON.stringify(b)});return r.json();}catch{return{success:false};}},
  async put(p,b){try{const r=await fetch(API_BASE+p,{method:'PUT',headers:this.headers(),body:JSON.stringify(b)});return r.json();}catch{return{success:false};}},
  async delete(p){try{const r=await fetch(API_BASE+p,{method:'DELETE',headers:this.headers()});return r.json();}catch{return{success:false};}}
};

const Auth = {
  getToken(){return localStorage.getItem('targo_token');},
  getUser(){try{return JSON.parse(localStorage.getItem('targo_user'));}catch{return null;}},
  isLoggedIn(){return!!this.getToken();},
  async login(emailOrPhone,password){const d=await api.post('/auth/login',{emailOrPhone,password});if(d.success){localStorage.setItem('targo_token',d.token);localStorage.setItem('targo_user',JSON.stringify(d.user));}return d;},
  async register(name,emailOrPhone,password){const isPhone=/^01/.test(emailOrPhone);const b={name,password,...(isPhone?{phone:emailOrPhone}:{email:emailOrPhone})};const d=await api.post('/auth/register',b);if(d.success){localStorage.setItem('targo_token',d.token);localStorage.setItem('targo_user',JSON.stringify(d.user));}return d;},
  logout(){localStorage.removeItem('targo_token');localStorage.removeItem('targo_user');window.location.href='/pages/login.html';}
};

const Cart = {
  get(){return JSON.parse(localStorage.getItem('targo_cart')||'[]');},
  save(c){localStorage.setItem('targo_cart',JSON.stringify(c));this.updateBadge();},
  add(product,qty=1,color='',size=''){const c=this.get();const ex=c.find(i=>i.product===product._id&&i.color===color&&i.size===size);if(ex)ex.quantity+=qty;else c.push({product:product._id,name:product.name,image:product.images?.[0]||'',price:product.price,quantity:qty,color,size});this.save(c);showToast('✅ Added to Cart!');},
  remove(i){const c=this.get();c.splice(i,1);this.save(c);},
  updateQty(i,qty){const c=this.get();if(qty<1){this.remove(i);return;}c[i].quantity=qty;this.save(c);},
  clear(){localStorage.removeItem('targo_cart');this.updateBadge();},
  total(){return this.get().reduce((s,i)=>s+i.price*i.quantity,0);},
  count(){return this.get().reduce((s,i)=>s+i.quantity,0);},
  updateBadge(){const b=document.getElementById('cart-badge');if(b){const c=this.count();b.textContent=c;b.style.display=c?'flex':'none';}}
};

function fp(n){return '৳ '+Number(n).toLocaleString();}
function imgUrl(img){if(!img)return'';if(img.startsWith('http'))return img;return API_BASE.replace('/api','')+img;}
function getParams(){return Object.fromEntries(new URLSearchParams(window.location.search));}

function showToast(msg,type='success'){
  let t=document.getElementById('targo-toast');
  if(!t){t=document.createElement('div');t.id='targo-toast';t.style.cssText='position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 20px;border-radius:10px;font-family:Inter,sans-serif;font-size:13px;font-weight:600;max-width:300px;box-shadow:0 4px 20px rgba(0,0,0,.15);transition:.3s;opacity:0;transform:translateY(10px)';document.body.appendChild(t);}
  t.textContent=msg;
  t.style.background=type==='error'?'#E53935':type==='info'?'#6366F1':'#00C853';
  t.style.color='#fff';t.style.opacity='1';t.style.transform='translateY(0)';
  clearTimeout(t._t);t._t=setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(10px)';},3000);
}

function renderNav(activePage=''){
  const user=Auth.getUser();
  return `
  <div class="topbar">
    <div class="topbar-left">🇧🇩 Bangladesh's Smart Marketplace | <span>Free Delivery on orders ৳999+</span></div>
    <div class="topbar-right"><a href="#">Sell on TargoBD</a><a href="/pages/track.html">Track Order</a><a href="#">Help</a></div>
  </div>
  <nav>
    <div class="nav-main">
      <a href="/index.html" class="logo"><div class="logo-box">T</div><div class="logo-txt">Targo<span>BD</span></div></a>
      <div class="search-bar">
        <select id="search-cat"><option value="">All</option></select>
        <input id="search-input" type="text" placeholder="Search products, brands and more...">
        <button onclick="doSearch()">🔍</button>
      </div>
      <div class="nav-icons">
        <a href="/pages/account.html" class="nav-icon" ${activePage==='account'?'style="color:#FF6B00"':''}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          <span id="nav-user-label">${user?user.name?.split(' ')[0]:'Account'}</span>
        </a>
        <a href="/pages/wishlist.html" class="nav-icon" ${activePage==='wishlist'?'style="color:#FF6B00"':''}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          <span>Wishlist</span>
        </a>
        <a href="/pages/cart.html" class="nav-icon" ${activePage==='cart'?'style="color:#FF6B00"':''}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          <span>Cart</span>
          <div class="nav-badge" id="cart-badge" style="display:none">0</div>
        </a>
      </div>
    </div>
    <div class="nav-sub" id="main-nav">
      <a href="/index.html" ${activePage==='home'?'class="active"':''}>🏠 Home</a>
      <a href="/pages/products.html?flash=true">🔥 Flash Sale</a>
      <a href="/pages/products.html" ${activePage==='products'?'class="active"':''}>🛍️ All Products</a>
    </div>
  </nav>`;
}

function renderFooter(){
  return `
  <footer>
    <div class="footer-grid">
      <div class="footer-brand">
        <h3>Targo<span>BD</span></h3>
        <p>Bangladesh's smartest marketplace. Quality products, fast delivery, and trusted service.</p>
        <div class="footer-social"><div class="social-btn">📘</div><div class="social-btn">📸</div><div class="social-btn">▶️</div><div class="social-btn">💬</div></div>
      </div>
      <div class="footer-col"><h4>Quick Links</h4><a href="/index.html">Home</a><a href="/pages/products.html">All Products</a><a href="/pages/products.html?flash=true">Flash Sale</a><a href="/pages/track.html">Track Order</a></div>
      <div class="footer-col"><h4>Customer Care</h4><a href="#">FAQ</a><a href="#">Return Policy</a><a href="#">Help Center</a><a href="#">Contact Us</a></div>
      <div class="footer-col"><h4>Sell With Us</h4><a href="#">Become a Seller</a><a href="#">Seller Guide</a><a href="#">Commission</a><a href="#">Advertise</a></div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 TargoBD E-Commerce. All rights reserved. 🇧🇩</p>
      <div class="payment-icons">
        <div class="payment-icon bkash">bKash</div>
        <div class="payment-icon nagad">Nagad</div>
        <div class="payment-icon">VISA</div>
        <div class="payment-icon">MasterCard</div>
        <div class="payment-icon">💵 COD</div>
      </div>
    </div>
  </footer>`;
}

function initNav(){
  api.get('/categories').then(d=>{
    const nav=document.getElementById('main-nav');
    const sel=document.getElementById('search-cat');
    if(nav&&sel){(d.categories||[]).forEach(c=>{nav.innerHTML+=`<a href="/pages/products.html?category=${c._id}">${c.icon} ${c.name}</a>`;sel.innerHTML+=`<option value="${c._id}">${c.name}</option>`;});}
  });
  Cart.updateBadge();
}

function doSearch(){
  const q=document.getElementById('search-input')?.value?.trim();
  const cat=document.getElementById('search-cat')?.value;
  let url='/pages/products.html?';
  if(q) url+=`search=${encodeURIComponent(q)}&`;
  if(cat) url+=`category=${cat}`;
  window.location.href=url;
}

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('search-input')?.addEventListener('keydown',e=>{if(e.key==='Enter')doSearch();});
  initNav();
});
