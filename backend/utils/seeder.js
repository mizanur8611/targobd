require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product  = require('../models/Product');
const User     = require('../models/User');

const CATEGORIES = [
  { name:'ইলেকট্রনিক্স', nameEn:'Electronics', slug:'electronics', icon:'📱', order:1 },
  { name:'ফ্যাশন',       nameEn:'Fashion',     slug:'fashion',     icon:'👗', order:2 },
  { name:'গৃহস্থালি',    nameEn:'Home',        slug:'home',        icon:'🏠', order:3 },
  { name:'সৌন্দর্য',     nameEn:'Beauty',      slug:'beauty',      icon:'💄', order:4 },
  { name:'শিশু পণ্য',    nameEn:'Baby',        slug:'baby',        icon:'👶', order:5 },
  { name:'অর্গানিক',     nameEn:'Organic',     slug:'organic',     icon:'🌾', order:6 },
  { name:'গেমিং',        nameEn:'Gaming',      slug:'gaming',      icon:'🎮', order:7 },
  { name:'স্পোর্টস',     nameEn:'Sports',      slug:'sports',      icon:'⚽', order:8 },
];

const getProducts = (catMap) => [
  { name:'Samsung Galaxy A55 5G (8GB/128GB)', description:'৬.৬" Super AMOLED ডিসপ্লে, ৫০MP ক্যামেরা, ৫০০০mAh ব্যাটারি। ১ বছর অফিশিয়াল ওয়ারেন্টি সহ।', price:29990, originalPrice:35000, category:catMap['electronics'], stock:50, badge:'HOT', isFlashSale:true, isFeatured:true, images:[], tags:['samsung','phone','mobile'], deliveryNote:'ঢাকায় ১-২ দিন, সারাদেশে ২-৪ দিন' },
  { name:'Sony WH-1000XM5 ওয়্যারলেস হেডফোন', description:'Industry-leading noise cancellation। ৩০ ঘণ্টা ব্যাটারি লাইফ। Multi-device connection।', price:8990, originalPrice:15000, category:catMap['electronics'], stock:30, badge:'SALE', isFlashSale:true, images:[], tags:['sony','headphone','audio'] },
  { name:'HP Pavilion 15 i5 12th Gen ল্যাপটপ', description:'Intel Core i5 12th Gen, 8GB RAM, 512GB SSD, 15.6" FHD IPS Display। Windows 11 সহ।', price:54990, originalPrice:65000, category:catMap['electronics'], stock:20, badge:'NEW', isFeatured:true, images:[], tags:['hp','laptop','computer'] },
  { name:'Smart Watch Pro Max (Health Monitor)', description:'Blood oxygen monitor, heart rate, sleep tracker, 7 দিনের ব্যাটারি। IP68 waterproof।', price:1990, originalPrice:3500, category:catMap['electronics'], stock:100, badge:'HOT', isFlashSale:true, images:[], tags:['smartwatch','watch','health'] },
  { name:'Adidas Ultraboost 22 রানিং স্নিকার', description:'Boost midsole technology। Primeknit upper। পুরুষ ও মহিলা উভয়ের জন্য। সাইজ 38-45।', price:3490, originalPrice:5500, category:catMap['fashion'], stock:80, badge:'NEW', isFlashSale:true, images:[], tags:['adidas','shoes','sneaker'], sizes:['38','39','40','41','42','43','44','45'] },
  { name:'ক্যাজুয়াল কটন শার্ট (Premium Quality)', description:'১০০% কটন। হাতে ধোয়া যাবে। ৫টি রঙে পাওয়া যায়। Regular fit।', price:890, originalPrice:1400, category:catMap['fashion'], stock:200, badge:'SALE', images:[], tags:['shirt','fashion','cotton'], colors:[{name:'সাদা',code:'#FFFFFF'},{name:'নীল',code:'#1A4A8A'},{name:'কালো',code:'#111111'},{name:'লাল',code:'#E8190A'}], sizes:['S','M','L','XL','XXL'] },
  { name:'Anti-Theft ব্যাকপ্যাক (USB Charging Port)', description:'30L capacity। USB charging port। Water resistant। Laptop compartment (15.6" পর্যন্ত)।', price:1690, originalPrice:2500, category:catMap['fashion'], stock:60, isFeatured:true, images:[], tags:['bag','backpack','travel'] },
  { name:'স্মার্ট ব্লেন্ডার (1000W Professional)', description:'1000W motor। 6টি stainless steel blade। 1.5L BPA-free jar। 5 speed settings।', price:2490, originalPrice:3800, category:catMap['home'], stock:45, badge:'HOT', images:[], tags:['blender','kitchen','home'] },
  { name:'Bamboo Organizer Shelf (5 Layer)', description:'Bamboo wood। Easy assembly। ৫টি shelf। বেডরুম, অফিস, কিচেন সব জায়গায় ব্যবহার করা যাবে।', price:1890, originalPrice:2800, category:catMap['home'], stock:35, isFeatured:true, images:[], tags:['shelf','organizer','home'] },
  { name:'Neem Face Wash (Organic Formula)', description:'100% natural ingredients। Oil control। Acne-fighting। Suitable for all skin types। Paraben-free।', price:349, originalPrice:550, category:catMap['beauty'], stock:150, badge:'NEW', isFeatured:true, images:[], tags:['facewash','skincare','organic'] },
  { name:'Vitamin C Serum 30ml (Anti-Aging)', description:'20% Vitamin C। Hyaluronic Acid। Brightening formula। Reduces dark spots। Cruelty-free।', price:590, originalPrice:900, category:catMap['beauty'], stock:80, images:[], tags:['serum','skincare','vitamin c'] },
  { name:'Organic Darjeeling চা (500g Premium)', description:'First flush Darjeeling tea। Hand-picked। No artificial flavors। Anti-oxidant rich।', price:890, originalPrice:1200, category:catMap['organic'], stock:100, isFeatured:true, images:[], tags:['tea','organic','darjeeling'] },
  { name:'Cold-Pressed নারকেল তেল (500ml)', description:'Virgin cold-pressed। Unrefined। Multiple uses: hair, skin, cooking। USDA Organic certified।', price:490, originalPrice:750, category:catMap['organic'], stock:120, images:[], tags:['coconut oil','organic','hair'] },
  { name:'Gaming Mouse RGB (16000 DPI)', description:'16000 DPI optical sensor। 7 programmable buttons। RGB lighting। Ergonomic design। 1.8m braided cable।', price:1290, originalPrice:2000, category:catMap['gaming'], stock:55, badge:'HOT', images:[], tags:['mouse','gaming','rgb'] },
  { name:'Football Nike Strike (Size 5)', description:'Machine-stitched। High-visibility graphic। Durable rubber bladder। FIFA approved। Size 5।', price:1190, originalPrice:1800, category:catMap['sports'], stock:70, images:[], tags:['football','nike','sports'] },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/targobd');
    console.log('✅ MongoDB Connected');

    // Clear existing
    await Promise.all([Category.deleteMany({}), Product.deleteMany({})]);
    console.log('🗑️  Old data cleared');

    // Create categories
    const createdCats = await Category.insertMany(CATEGORIES);
    const catMap = {};
    createdCats.forEach(c => { catMap[c.slug] = c._id; });
    console.log(`✅ ${createdCats.length} categories created`);

    // Create products
    const products = getProducts(catMap);
    const createdProds = await Product.insertMany(products);
    console.log(`✅ ${createdProds.length} products created`);

    // Create admin if not exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name:     'Admin',
        email:    process.env.ADMIN_EMAIL    || 'admin@targobd.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role:     'admin',
        isVerified: true
      });
      console.log('✅ Admin account created');
      console.log(`   Email:    ${process.env.ADMIN_EMAIL || 'admin@targobd.com'}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
    } else {
      console.log('ℹ️  Admin already exists, skipped');
    }

    console.log('\n🎉 Seeding complete! TargoBD is ready to go.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
