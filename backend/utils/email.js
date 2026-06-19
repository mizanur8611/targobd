const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// ─── Order Confirmation Email ───────────────────────────────────────────────
exports.sendOrderConfirmation = async (order) => {
  if (!process.env.EMAIL_USER) return;
  try {
    const transporter = createTransporter();
    const itemsHtml = order.items.map(i =>
      `<tr><td style="padding:8px;border-bottom:1px solid #f0f0f0">${i.name}</td>
       <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td>
       <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right;color:#E8190A;font-weight:700">৳${i.price * i.quantity}</td></tr>`
    ).join('');

    // Notify admin
    await transporter.sendMail({
      from: `TargoBD <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `🛒 নতুন অর্ডার #${order.orderNumber} — ৳${order.total}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#0F0F14,#1a0505);padding:20px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:24px">Targo<span style="color:#FF3B2E">BD</span></h1>
            <p style="color:rgba(255,255,255,0.5);margin:5px 0 0;font-size:12px">Admin Notification</p>
          </div>
          <div style="padding:24px;background:#fff">
            <h2 style="color:#E8190A;margin-top:0">🛒 নতুন অর্ডার পাওয়া গেছে!</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
              <tr><td style="padding:6px 0;color:#888;font-size:13px">অর্ডার নং:</td><td style="padding:6px 0;font-weight:700;color:#E8190A">#${order.orderNumber}</td></tr>
              <tr><td style="padding:6px 0;color:#888;font-size:13px">কাস্টমার:</td><td style="padding:6px 0;font-weight:600">${order.customerName}</td></tr>
              <tr><td style="padding:6px 0;color:#888;font-size:13px">ফোন:</td><td style="padding:6px 0">${order.customerPhone}</td></tr>
              <tr><td style="padding:6px 0;color:#888;font-size:13px">ঠিকানা:</td><td style="padding:6px 0">${order.shippingAddress.address}, ${order.shippingAddress.area}, ${order.shippingAddress.district}</td></tr>
              <tr><td style="padding:6px 0;color:#888;font-size:13px">পেমেন্ট:</td><td style="padding:6px 0">${order.paymentMethod}</td></tr>
            </table>
            <table style="width:100%;border-collapse:collapse">
              <thead><tr style="background:#f5f5f7">
                <th style="padding:10px 8px;text-align:left;font-size:12px">পণ্য</th>
                <th style="padding:10px 8px;text-align:center;font-size:12px">পরিমাণ</th>
                <th style="padding:10px 8px;text-align:right;font-size:12px">মূল্য</th>
              </tr></thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="background:#f9f9f9;border-radius:8px;padding:14px;margin-top:16px">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#888">সাবটোটাল</span><span>৳${order.subtotal}</span></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#888">ডেলিভারি</span><span>${order.shippingFee === 0 ? 'ফ্রি' : '৳' + order.shippingFee}</span></div>
              <div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px;color:#E8190A"><span>মোট</span><span>৳${order.total}</span></div>
            </div>
          </div>
          <div style="background:#f5f5f7;padding:14px;text-align:center;font-size:11px;color:#888">
            TargoBD Admin Panel এ লগইন করে অর্ডারটি প্রসেস করুন।
          </div>
        </div>`
    });

    // Notify customer if email provided
    if (order.customerEmail) {
      await transporter.sendMail({
        from: `TargoBD <${process.env.EMAIL_USER}>`,
        to: order.customerEmail,
        subject: `✅ অর্ডার নিশ্চিত! #${order.orderNumber}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#0F0F14,#1a0505);padding:24px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:28px">Targo<span style="color:#FF3B2E">BD</span></h1>
            </div>
            <div style="padding:28px;background:#fff;text-align:center">
              <div style="font-size:48px;margin-bottom:10px">🎉</div>
              <h2 style="color:#111;margin-top:0">অর্ডার সফলভাবে গ্রহণ করা হয়েছে!</h2>
              <div style="background:#E8FFF5;border:1px solid #B3E6D0;border-radius:8px;padding:14px;margin:20px 0;display:inline-block">
                <div style="font-size:12px;color:#888;margin-bottom:4px">আপনার অর্ডার নম্বর</div>
                <div style="font-size:22px;font-weight:700;color:#00B96B">#${order.orderNumber}</div>
              </div>
              <p style="color:#444;font-size:13px;line-height:1.7">প্রিয় <strong>${order.customerName}</strong>,<br>আপনার অর্ডারটি পাওয়া গেছে। শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।</p>
              <div style="background:#f9f9f9;border-radius:8px;padding:14px;margin:20px 0;text-align:left">
                <div style="font-weight:700;margin-bottom:10px">অর্ডার সারসংক্ষেপ</div>
                ${itemsHtml.replace(/padding:8px/g,'padding:6px')}
                <div style="font-weight:700;color:#E8190A;text-align:right;margin-top:10px">মোট: ৳${order.total}</div>
              </div>
              <a href="${process.env.FRONTEND_URL}/pages/track.html?order=${order.orderNumber}"
                style="display:inline-block;background:linear-gradient(135deg,#E8190A,#FF6B00);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:10px">
                📦 অর্ডার ট্র্যাক করুন
              </a>
            </div>
            <div style="background:#0F0F14;padding:16px;text-align:center">
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">কোনো প্রশ্ন থাকলে যোগাযোগ করুন | TargoBD</p>
            </div>
          </div>`
      });
    }
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

// ─── Order Status Update Email ──────────────────────────────────────────────
exports.sendStatusUpdate = async (order) => {
  if (!process.env.EMAIL_USER || !order.customerEmail) return;
  const statusLabels = {
    confirmed:  '✅ অর্ডার নিশ্চিত হয়েছে',
    processing: '📦 প্যাকেজিং চলছে',
    shipped:    '🚚 পণ্য পাঠানো হয়েছে',
    delivered:  '🏠 ডেলিভারি সম্পন্ন',
    cancelled:  '❌ অর্ডার বাতিল'
  };
  const label = statusLabels[order.status] || order.status;
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `TargoBD <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `${label} — অর্ডার #${order.orderNumber}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff">
          <div style="background:linear-gradient(135deg,#0F0F14,#1a0505);padding:20px;text-align:center">
            <h1 style="color:#fff;margin:0">Targo<span style="color:#FF3B2E">BD</span></h1>
          </div>
          <div style="padding:28px;text-align:center">
            <h2 style="color:#111">${label}</h2>
            <p style="color:#444;font-size:13px">অর্ডার নং: <strong style="color:#E8190A">#${order.orderNumber}</strong></p>
            ${order.trackingNumber ? `<p style="color:#444;font-size:13px">ট্র্যাকিং নং: <strong>${order.trackingNumber}</strong> (${order.courier || ''})</p>` : ''}
            <a href="${process.env.FRONTEND_URL}/pages/track.html?order=${order.orderNumber}"
              style="display:inline-block;background:#E8190A;color:#fff;padding:11px 26px;border-radius:7px;text-decoration:none;font-weight:700;margin-top:14px">
              📦 অর্ডার ট্র্যাক করুন
            </a>
          </div>
        </div>`
    });
  } catch (err) {
    console.error('Status email error:', err.message);
  }
};
