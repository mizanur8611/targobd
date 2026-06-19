#!/bin/bash
# TargoBD Quick Start Script
# Run: bash setup.sh

echo ""
echo "=================================================="
echo "  🚀 TargoBD E-Commerce — Quick Setup"
echo "=================================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js পাওয়া যায়নি। আগে install করুন:"
  echo "   https://nodejs.org (v18+ recommended)"
  exit 1
fi

NODE_VER=$(node -v)
echo "✅ Node.js: $NODE_VER"

# Check if .env exists
if [ ! -f "backend/.env" ]; then
  echo ""
  echo "📝 .env file তৈরি হচ্ছে..."
  cp backend/.env.example backend/.env
  echo "⚠️  backend/.env ফাইলটি খুলুন এবং MONGODB_URI সেট করুন!"
  echo ""
fi

# Install backend dependencies
echo "📦 Backend dependencies install হচ্ছে..."
cd backend
npm install
echo "✅ Dependencies installed"

# Ask to seed
echo ""
read -p "🌱 Demo data (categories + products) যোগ করবেন? (y/n): " seed_ans
if [[ "$seed_ans" == "y" || "$seed_ans" == "Y" ]]; then
  echo "🌱 Seeding database..."
  node utils/seeder.js
fi

echo ""
echo "=================================================="
echo "  ✅ Setup সম্পন্ন!"
echo "=================================================="
echo ""
echo "Backend start করতে:"
echo "  cd backend && npm run dev"
echo ""
echo "Frontend দেখতে:"
echo "  frontend/index.html ব্রাউজারে খুলুন"
echo ""
echo "Admin Panel:"
echo "  admin/index.html ব্রাউজারে খুলুন"
echo "  Email: admin@targobd.com"
echo "  Password: Admin@123456"
echo ""
echo "API Health Check:"
echo "  http://localhost:5000/api/health"
echo ""
