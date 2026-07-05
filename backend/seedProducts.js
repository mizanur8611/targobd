/**
 * seedProducts.js
 * ----------------------------------------------------------------
 * TargoBD — 20 demo products seed script
 *
 * USAGE:
 *   1. Place this file in your backend/ folder (same level as package.json)
 *   2. Make sure your .env has MONGO_URI set (same as your server uses)
 *   3. Run:  node seedProducts.js
 *
 * What it does:
 *   - Connects to MongoDB using MONGO_URI from .env
 *   - Looks up each category by its `slug` field to get the real ObjectId
 *   - Inserts 20 products, each linked to the correct category
 *   - Skips products that already exist (matched by `name`) so it's safe
 *     to run multiple times without creating duplicates
 *   - Prints a summary at the end
 * ----------------------------------------------------------------
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env. Please set it and try again.');
  process.exit(1);
}

// ────────────────────────────────────────────────────────────────
// 20 products. `categorySlug` must match an existing Category.slug
// in your database (electronics, fashion, home, beauty, baby, organic).
// ────────────────────────────────────────────────────────────────
const PRODUCTS = [
  // ── Electronics ──────────────────────────────────────────────
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'High quality wireless bluetooth headphones with deep bass and long battery life. Perfect for music, calls, and travel.',
    price: 1890,
    originalPrice: 2500,
    categorySlug: 'electronics',
    images: ['https://images.unsplash.com/photo-1578319439584-104c94d37305?w=800&q=80&auto=format&fit=crop'],
    stock: 45,
    badge: 'HOT',
    tags: ['headphones', 'bluetooth', 'audio', 'wireless']
  },
  {
    name: 'Smart Watch',
    description: 'Feature-packed smart watch with fitness tracking, heart rate monitor, and notification support.',
    price: 2450,
    originalPrice: 3200,
    categorySlug: 'electronics',
    images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80&auto=format&fit=crop'],
    stock: 30,
    badge: 'NEW',
    tags: ['smartwatch', 'fitness', 'wearable']
  },
  {
    name: 'Power Bank 20000mAh',
    description: 'High capacity 20000mAh power bank with fast charging support for phones and tablets.',
    price: 1650,
    originalPrice: 2100,
    categorySlug: 'electronics',
    images: ['https://images.unsplash.com/photo-1706275399494-fb26bbc5da63?w=800&q=80&auto=format&fit=crop'],
    stock: 60,
    tags: ['powerbank', 'charger', 'battery']
  },
  {
    name: 'Wireless Gaming Mouse',
    description: 'Ergonomic wireless gaming mouse with adjustable DPI and smooth tracking.',
    price: 1290,
    originalPrice: 1700,
    categorySlug: 'electronics',
    images: ['https://images.unsplash.com/photo-1707592691247-5c3a1c7ba0e3?w=800&q=80&auto=format&fit=crop'],
    stock: 50,
    tags: ['mouse', 'gaming', 'wireless', 'pc accessory']
  },
  {
    name: 'Mechanical RGB Keyboard',
    description: 'Mechanical keyboard with customizable RGB backlight, ideal for gaming and typing.',
    price: 3200,
    originalPrice: 4000,
    categorySlug: 'electronics',
    images: ['https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=800&q=80&auto=format&fit=crop'],
    stock: 25,
    badge: 'SALE',
    tags: ['keyboard', 'gaming', 'rgb', 'mechanical']
  },

  // ── Fashion ──────────────────────────────────────────────────
  {
    name: "Men's Cotton Casual Shirt",
    description: 'Premium cotton casual shirt for men, comfortable and breathable for everyday wear.',
    price: 850,
    originalPrice: 1200,
    categorySlug: 'fashion',
    images: ['https://images.unsplash.com/photo-1602810316693-3667c854239a?w=800&q=80&auto=format&fit=crop'],
    stock: 80,
    tags: ['shirt', 'men', 'casual', 'cotton']
  },
  {
    name: "Women's Summer Dress",
    description: 'Light and elegant summer dress for women, perfect for warm weather and casual outings.',
    price: 1450,
    originalPrice: 1900,
    categorySlug: 'fashion',
    images: ['https://images.unsplash.com/photo-1611338687460-20881d00fe53?w=800&q=80&auto=format&fit=crop'],
    stock: 40,
    badge: 'NEW',
    tags: ['dress', 'women', 'summer', 'fashion']
  },
  {
    name: 'Leather Handbag',
    description: 'Stylish leather handbag with spacious compartments, suitable for daily use and outings.',
    price: 2200,
    originalPrice: 2900,
    categorySlug: 'fashion',
    images: ['https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=800&q=80&auto=format&fit=crop'],
    stock: 35,
    tags: ['handbag', 'leather', 'women', 'accessory']
  },
  {
    name: 'Running Sneakers',
    description: 'Comfortable running sneakers with breathable mesh upper and cushioned sole.',
    price: 2650,
    originalPrice: 3400,
    categorySlug: 'fashion',
    images: ['https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&q=80&auto=format&fit=crop'],
    stock: 55,
    badge: 'HOT',
    tags: ['shoes', 'sneakers', 'running', 'sports']
  },

  // ── Home ─────────────────────────────────────────────────────
  {
    name: 'Ceramic Dinnerware Set',
    description: 'Elegant ceramic dinnerware set including plates, bowls, and serving dishes.',
    price: 1990,
    originalPrice: 2600,
    categorySlug: 'home',
    images: ['https://images.unsplash.com/photo-1587334207810-4915c4e40c67?w=800&q=80&auto=format&fit=crop'],
    stock: 28,
    tags: ['dinnerware', 'ceramic', 'kitchen', 'home']
  },
  {
    name: 'Non-Stick Frying Pan',
    description: 'Durable non-stick frying pan suitable for everyday cooking, easy to clean.',
    price: 1100,
    originalPrice: 1450,
    categorySlug: 'home',
    images: ['https://images.unsplash.com/photo-1581622558638-818128465982?w=800&q=80&auto=format&fit=crop'],
    stock: 40,
    tags: ['cookware', 'pan', 'kitchen', 'non-stick']
  },
  {
    name: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with multiple brightness levels, ideal for study and work.',
    price: 980,
    originalPrice: 1300,
    categorySlug: 'home',
    images: ['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80&auto=format&fit=crop'],
    stock: 50,
    tags: ['lamp', 'led', 'desk', 'lighting']
  },
  {
    name: 'Cotton Bedsheet Set',
    description: 'Soft cotton bedsheet set with pillow covers, comfortable and breathable for a good night sleep.',
    price: 1350,
    originalPrice: 1800,
    categorySlug: 'home',
    images: ['https://images.unsplash.com/photo-1602810440788-9a23e9af08e1?w=800&q=80&auto=format&fit=crop'],
    stock: 38,
    tags: ['bedsheet', 'bedding', 'cotton', 'home']
  },

  // ── Beauty ───────────────────────────────────────────────────
  {
    name: 'Vitamin C Face Serum',
    description: 'Brightening vitamin C face serum that helps reduce dark spots and even skin tone.',
    price: 750,
    originalPrice: 1000,
    categorySlug: 'beauty',
    images: ['https://images.unsplash.com/photo-1690368972445-5e5b5d509742?w=800&q=80&auto=format&fit=crop'],
    stock: 65,
    badge: 'NEW',
    tags: ['serum', 'skincare', 'vitamin c', 'beauty']
  },
  {
    name: 'Hyaluronic Acid Moisturizer',
    description: 'Hydrating moisturizer with hyaluronic acid for soft, smooth, and well-nourished skin.',
    price: 690,
    originalPrice: 900,
    categorySlug: 'beauty',
    images: ['https://images.unsplash.com/photo-1690368892771-566e77c3b352?w=800&q=80&auto=format&fit=crop'],
    stock: 58,
    tags: ['moisturizer', 'skincare', 'hydration', 'beauty']
  },
  {
    name: 'Matte Lipstick Set',
    description: 'Long-lasting matte lipstick set in multiple shades for everyday and special occasions.',
    price: 850,
    originalPrice: 1150,
    categorySlug: 'beauty',
    images: ['https://images.unsplash.com/photo-1571646034647-52e6ea84b28c?w=800&q=80&auto=format&fit=crop'],
    stock: 42,
    badge: 'SALE',
    tags: ['lipstick', 'makeup', 'cosmetics', 'beauty']
  },

  // ── Baby ─────────────────────────────────────────────────────
  {
    name: 'Baby Diaper Pack',
    description: 'Soft and absorbent baby diaper pack designed for comfort and all-day protection.',
    price: 950,
    originalPrice: 1250,
    categorySlug: 'baby',
    images: ['https://images.unsplash.com/photo-1584839404042-8bc21d240e91?w=800&q=80&auto=format&fit=crop'],
    stock: 70,
    tags: ['diaper', 'baby care', 'newborn']
  },
  {
    name: 'Baby Feeding Bottle',
    description: 'BPA-free baby feeding bottle with anti-colic design for comfortable feeding.',
    price: 420,
    originalPrice: 550,
    categorySlug: 'baby',
    images: ['https://images.unsplash.com/photo-1623707430616-d9f956bcac2b?w=800&q=80&auto=format&fit=crop'],
    stock: 55,
    tags: ['feeding bottle', 'baby care', 'newborn']
  },

  // ── Organic ──────────────────────────────────────────────────
  {
    name: 'Organic Honey',
    description: 'Pure organic honey, naturally sourced and unprocessed for everyday health benefits.',
    price: 650,
    originalPrice: 850,
    categorySlug: 'organic',
    images: ['https://images.unsplash.com/photo-1568657704598-602700bd9694?w=800&q=80&auto=format&fit=crop'],
    stock: 48,
    tags: ['honey', 'organic', 'natural', 'food']
  },
  {
    name: 'Organic Green Tea',
    description: 'Premium organic green tea leaves, rich in antioxidants for a healthy daily routine.',
    price: 380,
    originalPrice: 500,
    categorySlug: 'organic',
    images: ['https://images.unsplash.com/photo-1760074057746-388f7e66c61e?w=800&q=80&auto=format&fit=crop'],
    stock: 62,
    tags: ['tea', 'green tea', 'organic', 'beverage']
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Build a slug -> ObjectId map from existing categories
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.error('❌ No categories found in DB. Please create categories first (electronics, fashion, home, beauty, baby, organic).');
      process.exit(1);
    }

    const slugToId = {};
    categories.forEach(c => { slugToId[c.slug] = c._id; });

    console.log('📂 Found categories:', Object.keys(slugToId).join(', '));

    let inserted = 0;
    let skipped = 0;
    let missingCategory = 0;

    for (const p of PRODUCTS) {
      const categoryId = slugToId[p.categorySlug];

      if (!categoryId) {
        console.warn(`⚠️  Skipping "${p.name}" — category slug "${p.categorySlug}" not found in DB.`);
        missingCategory++;
        continue;
      }

      const exists = await Product.findOne({ name: p.name });
      if (exists) {
        console.log(`⏭️  Already exists, skipping: ${p.name}`);
        skipped++;
        continue;
      }

      const { categorySlug, ...rest } = p;
      await Product.create({
        ...rest,
        category: categoryId
      });

      console.log(`✅ Inserted: ${p.name}`);
      inserted++;
    }

    console.log('\n──────── Summary ────────');
    console.log(`Inserted:          ${inserted}`);
    console.log(`Already existed:   ${skipped}`);
    console.log(`Missing category:  ${missingCategory}`);
    console.log('──────────────────────────\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB. Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed script failed:', err.message);
    process.exit(1);
  }
}

seed();
