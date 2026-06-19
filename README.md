# TargoBD — Full Stack E-Commerce
## সম্পূর্ণ Deployment Guide 🚀

---

## 📁 Project Structure

```
targobd/
├── backend/
│   ├── models/          # User, Product, Order, Category, Review
│   ├── routes/          # auth, products, orders, categories, reviews, admin
│   ├── middleware/       # auth.js (JWT)
│   ├── server.js        # Main entry point
│   ├── package.json
│   └── .env.example     # → এটা copy করে .env বানান
├── frontend/
│   ├── index.html       # Homepage
│   ├── css/main.css     # সব styles
│   ├── js/
│   │   ├── api.js       # API client, Cart, Auth helpers
│   │   └── layout.js    # Header, Footer
│   └── pages/
│       ├── product.html      # পণ্য বিবরণ
│       ├── products.html     # পণ্য তালিকা
│       ├── cart.html         # কার্ট
│       ├── login.html        # লগইন / রেজিস্ট্রেশন
│       ├── track.html        # অর্ডার ট্র্যাকিং
│       └── orders.html       # আমার অর্ডার
└── admin/
    └── index.html       # Admin Panel
```

---

## 🔧 Step 1: MongoDB Atlas Setup (Free)

1. **mongodb.com/atlas** → Sign Up (Free)
2. **Create Cluster** → Free Tier → Cloud Provider: AWS → Region: Asia (Mumbai)
3. **Database Access** → Add User → Username/Password মনে রাখুন
4. **Network Access** → Add IP Address → **0.0.0.0/0** (সব IP allow)
5. **Connect** → Connect your application → Connection string copy করুন

```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/targobd
```

---

## ⚙️ Step 2: Backend Setup

```bash
# Backend folder-এ যান
cd backend

# Dependencies install করুন
npm install

# .env file তৈরি করুন
cp .env.example .env
```

**.env file এ এই তথ্য দিন:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/targobd
JWT_SECRET=targobd_super_secret_2026_xyz
PORT=5000
FRONTEND_URL=https://আপনার-ডোমেইন.com
EMAIL_USER=your@gmail.com
EMAIL_PASS=gmail_app_password
```

**Gmail App Password পেতে:**
1. Gmail → Settings → Security → 2-Step Verification চালু করুন
2. App Passwords → Generate → "Mail" → Copy the password

---

## 🌐 Step 3: Deploy Backend

### Option A: Railway.app (সবচেয়ে সহজ — Free দিয়ে শুরু)
```bash
# railway.app → Sign up with GitHub
# New Project → Deploy from GitHub repo
# Variables tab-এ .env values দিন
# Deploy হয়ে যাবে, URL পাবেন যেমন:
# https://targobd-backend.railway.app
```

### Option B: Render.com (Free tier আছে)
```bash
# render.com → New Web Service → Connect GitHub
# Build Command: npm install
# Start Command: node server.js
# Environment Variables add করুন
```

### Option C: VPS (Hostinger/DigitalOcean)
```bash
# SSH দিয়ে connect করুন
ssh root@YOUR_SERVER_IP

# Node.js install
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 install (process manager)
npm install -g pm2

# Project upload করুন (FTP বা git clone)
cd /var/www/targobd/backend

# Dependencies install
npm install

# .env file তৈরি করুন
nano .env  # সব values দিন, Ctrl+X → Y → Enter

# Start with PM2
pm2 start server.js --name targobd-api
pm2 startup
pm2 save

# Nginx setup
sudo apt install nginx -y
```

**Nginx Config (/etc/nginx/sites-available/targobd):**
```nginx
server {
    listen 80;
    server_name api.আপনার-ডোমেইন.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/targobd /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL (Let's Encrypt — Free)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.আপনার-ডোমেইন.com
```

---

## 🌍 Step 4: Deploy Frontend

### Option A: Netlify (সবচেয়ে সহজ — Free)
```bash
# netlify.com → Sign up
# Drag & Drop করুন "frontend" folder
# Deploy হয়ে যাবে!
# Custom domain add করুন আপনার ডোমেইন

# IMPORTANT: frontend/js/api.js এ API URL বদলান:
# const API_BASE = 'https://your-backend.railway.app/api';
```

### Option B: Hostinger Shared Hosting
```bash
# File Manager বা FTP দিয়ে frontend/ এর সব files
# public_html folder এ upload করুন
# api.js এ API URL set করুন
```

### Option C: Same VPS (Nginx দিয়ে)
```nginx
server {
    listen 80;
    server_name আপনার-ডোমেইন.com www.আপনার-ডোমেইন.com;
    root /var/www/targobd/frontend;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /admin {
        root /var/www/targobd;
        try_files $uri $uri/ /admin/index.html;
    }
}
```

---

## 👑 Step 5: Admin Account তৈরি করুন

Backend deploy করার পরে, **একবার** এই API call করুন:

```bash
curl -X POST https://your-backend-url.com/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@targobd.com",
    "phone": "01700000000",
    "password": "YourSecurePassword123"
  }'
```

অথবা Browser-এ Postman/Insomnia দিয়ে POST করুন।

এরপর `/pages/login.html` এ গিয়ে admin login করুন।

---

## 📦 Step 6: প্রথম কিছু কাজ (Admin Panel)

1. **লগইন করুন** → `/pages/login.html`
2. **ক্যাটাগরি যোগ করুন** → Admin Panel → ক্যাটাগরি
   ```
   নাম: ইলেকট্রনিক্স, Slug: electronics, Icon: 📱
   নাম: ফ্যাশন, Slug: fashion, Icon: 👗
   নাম: গৃহস্থালি, Slug: home, Icon: 🏠
   ```
3. **পণ্য যোগ করুন** → Admin Panel → পণ্য → নতুন পণ্য

---

## 🔗 Important URLs

| URL | কাজ |
|-----|-----|
| `/index.html` | Homepage |
| `/pages/products.html` | সব পণ্য |
| `/pages/cart.html` | কার্ট |
| `/pages/login.html` | লগইন |
| `/pages/track.html` | অর্ডার ট্র্যাক |
| `/admin/index.html` | Admin Panel |
| `https://api.domain.com/api/health` | API Health Check |

---

## 💰 খরচ (আনুমানিক)

| সার্ভিস | খরচ |
|---------|------|
| Domain (.com) | ৳১,২০০/বছর |
| MongoDB Atlas | ফ্রি (৫১২MB) |
| Railway/Render | ফ্রি (শুরুতে) |
| Netlify Frontend | ফ্রি |
| **মোট শুরুতে** | **৳১,২০০/বছর** |
| Hostinger VPS (পরে) | ৳৩০০-৬০০/মাস |

---

## 🆘 সমস্যা হলে

**CORS Error:** backend/server.js এ `FRONTEND_URL` সঠিক দিন

**MongoDB connection failed:** 
- Network Access → 0.0.0.0/0 allow করুন
- Username/Password সঠিক কিনা দেখুন

**API not working:** 
- `https://your-api/api/health` এ GET করুন
- PM2 logs: `pm2 logs targobd-api`

---

## 📞 Features Summary

✅ Homepage (Hero Slider, Flash Sale, Categories, Featured)
✅ Product Listing (Filter, Sort, Search, Pagination)
✅ Product Detail (Gallery, COD Form, Reviews)
✅ Cart (Add/Remove/Update, COD Checkout)
✅ Login/Register (JWT Auth)
✅ Order Tracking (Public, no login needed)
✅ Admin Dashboard (Stats, Charts)
✅ Admin Orders (Status Update, Courier Info)
✅ Admin Products (CRUD)
✅ Admin Categories (CRUD)
✅ Admin Users (View, Block/Unblock)
✅ Admin Reviews (Approve/Hide)
✅ Responsive Mobile Design
✅ Email Notification (Gmail SMTP)

---

**Made with ❤️ for TargoBD**
