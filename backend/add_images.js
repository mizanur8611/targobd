require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const imageMap = [
  { key: 'Samsung',      img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500' },
  { key: 'Sony',         img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
  { key: 'HP Pavilion',  img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500' },
  { key: 'Smart Watch',  img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
  { key: 'Adidas',       img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' },
  { key: 'Cotton',       img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500' },
  { key: 'Anti-Theft',   img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' },
  { key: 'Blender',      img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500' },
  { key: 'Bamboo',       img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500' },
  { key: 'Neem',         img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500' },
  { key: 'Vitamin',      img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500' },
  { key: 'Darjeeling',   img: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500' },
  { key: 'নারকেল',      img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500' },
  { key: 'Gaming Mouse', img: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500' },
  { key: 'Football',     img: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=500' },
];

const defaultImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ Connected to MongoDB!');
  const products = await Product.find({});
  console.log(`Found ${products.length} products\n`);

  for (const p of products) {
    let img = defaultImg;
    for (const { key, img: url } of imageMap) {
      if (p.name.includes(key)) { img = url; break; }
    }
    await Product.findByIdAndUpdate(p._id, { images: [img] });
    console.log(`✅ ${p.name.slice(0, 35).padEnd(35)} → image set`);
  }

  console.log('\n🎉 সব products এ image যোগ হয়েছে!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
