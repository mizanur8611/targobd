/**
 * utils/sendEmail.js
 * ইমেইল পাঠানোর জন্য reusable ফাংশন — Nodemailer ব্যবহার করে
 *
 * ইনস্টল করুন: npm install nodemailer
 *
 * .env ফাইলে যুক্ত করুন:
 * EMAIL_USER=your-gmail@gmail.com
 * EMAIL_PASS=your-16-digit-app-password   (Gmail এর সাধারণ পাসওয়ার্ড না, "App Password")
 * FRONTEND_URL=https://www.targobd.com
 *
 * ⚠️ Gmail App Password কীভাবে বানাবেন:
 * 1. https://myaccount.google.com/security এ যান
 * 2. "2-Step Verification" চালু করুন (না থাকলে)
 * 3. তারপর "App passwords" এ গিয়ে নতুন একটা বানান
 * 4. যে ১৬ ডিজিটের পাসওয়ার্ড দেবে সেটাই EMAIL_PASS এ বসান
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: `"TargoBD" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('❌ ইমেইল পাঠাতে সমস্যা হয়েছে:', err.message);
    return false;
  }
}

module.exports = sendEmail;
