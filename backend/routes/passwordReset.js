/**
 * routes/passwordReset.js
 * ============================
 * (আপডেটেড ভার্সন — আপনার আসল User মডেল ব্যবহার করে)
 *
 * ⚠️ এটা কাজ করার আগে models/User.js এ resetPasswordToken ও
 * resetPasswordExpires ফিল্ড যোগ করে নিন (আলাদা ফাইলে দেওয়া নির্দেশনা দেখুন)
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');   // ← আপনার আসল মডেল

// ─────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({ success: false, message: 'ইমেইল দিন' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // নিরাপত্তার জন্য: ইউজার না থাকলেও একই মেসেজ দেখানো হয়
    if (!user) {
      return res.json({
        success: true,
        message: 'যদি এই ইমেইলে অ্যাকাউন্ট থাকে, রিসেট লিংক পাঠানো হয়েছে',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // pre('save') hook যেন পাসওয়ার্ড আবার হ্যাশ না করে ফেলে, তাই
    // findByIdAndUpdate ব্যবহার করা হচ্ছে (এটা pre-save hook trigger করে না)
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: Date.now() + 15 * 60 * 1000, // 15 মিনিট
    });

    const resetUrl = `${process.env.FRONTEND_URL}/pages/reset-password.html?token=${resetToken}`;

    const emailSent = await sendEmail({
      to: user.email,
      subject: 'TargoBD — পাসওয়ার্ড রিসেট করুন',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#FF6B00;">TargoBD পাসওয়ার্ড রিসেট</h2>
          <p>হ্যালো ${user.name},</p>
          <p>আপনি পাসওয়ার্ড রিসেটের অনুরোধ করেছেন। নিচের বাটনে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন:</p>
          <a href="${resetUrl}" style="display:inline-block;background:#FF6B00;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
            পাসওয়ার্ড রিসেট করুন
          </a>
          <p style="color:#888;font-size:13px;">এই লিংকটি ১৫ মিনিটের জন্য কার্যকর থাকবে। আপনি যদি এই অনুরোধ না করে থাকেন, এই ইমেইলটি উপেক্ষা করুন।</p>
        </div>
      `,
    });

    if (!emailSent) {
      return res.json({ success: false, message: 'ইমেইল পাঠাতে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন' });
    }

    res.json({
      success: true,
      message: 'যদি এই ইমেইলে অ্যাকাউন্ট থাকে, রিসেট লিংক পাঠানো হয়েছে',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'কিছু ভুল হয়েছে' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/auth/reset-password/:token
// ─────────────────────────────────────────────────────────
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.json({ success: false, message: 'পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({
        success: false,
        message: 'লিংকের মেয়াদ শেষ হয়ে গেছে বা সঠিক নয়। আবার রিকোয়েস্ট করুন।',
      });
    }

    // user.save() ব্যবহার করা হচ্ছে যাতে আপনার pre('save') hook
    // স্বয়ংক্রিয়ভাবে পাসওয়ার্ড হ্যাশ করে দেয় (bcrypt cost 12 সহ)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! এখন লগইন করুন।' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'কিছু ভুল হয়েছে' });
  }
});

module.exports = router;
