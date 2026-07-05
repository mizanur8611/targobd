/**
 * TargoBD — Admin Password Reset Script
 * ========================================
 * এই স্ক্রিপ্টটা আপনার admin ইউজারের পাসওয়ার্ড নতুন করে সেট করে দেবে।
 *
 * কীভাবে ব্যবহার করবেন:
 * 1. এই ফাইলটা আপনার backend প্রজেক্টের রুটে রাখুন (যেখানে .env আছে)
 * 2. নিচের ADMIN_EMAIL ও NEW_PASSWORD পরিবর্তন করুন
 * 3. টার্মিনালে চালান: node reset-admin-password.js
 * 4. "✅ সফল হয়েছে" মেসেজ দেখলে নতুন পাসওয়ার্ড দিয়ে লগইন করুন
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ⚠️ এই দুইটা লাইন পরিবর্তন করুন
const ADMIN_EMAIL = 'admin@targobd.com';   // আপনার অ্যাডমিন ইমেইল
const NEW_PASSWORD = 'Targo@2026';         // নতুন পাসওয়ার্ড যা দিতে চান (কমপক্ষে ৬ ক্যারেক্টার)

async function resetPassword() {
  try {
    // .env থেকে MongoDB connection string নেওয়া হচ্ছে
    const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

    if (!MONGODB_URI) {
      console.error('❌ .env ফাইলে MONGODB_URI বা DATABASE_URL পাওয়া যায়নি');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB এ কানেক্ট হয়েছে');

    // আপনার User মডেলের নাম ও schema অনুযায়ী এটা ঠিক করুন
    // যদি আপনার models/User.js ফাইল থাকে, তাহলে সেটা require করে ব্যবহার করুন:
    // const User = require('./models/User');

    // অথবা সরাসরি ইনলাইন schema দিয়ে (যদি models ফোল্ডার খুঁজে পেতে সমস্যা হয়):
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');

    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    const result = await User.updateOne(
      { email: ADMIN_EMAIL },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      console.log(`❌ "${ADMIN_EMAIL}" ইমেইল দিয়ে কোনো ইউজার পাওয়া যায়নি`);
      console.log('   ইমেইলটা ঠিক আছে কিনা চেক করুন (case-sensitive হতে পারে)');
    } else {
      console.log(`✅ সফল হয়েছে! "${ADMIN_EMAIL}" এর পাসওয়ার্ড পরিবর্তন হয়েছে`);
      console.log(`   নতুন পাসওয়ার্ড: ${NEW_PASSWORD}`);
      console.log('   এখন এই পাসওয়ার্ড দিয়ে লগইন করুন');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ এরর হয়েছে:', err.message);
    process.exit(1);
  }
}

resetPassword();
