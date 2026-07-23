const nodemailer = require('nodemailer');

let cachedTransporter;
let cachedTransporterKey;

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  const key = `${SMTP_HOST}:${SMTP_PORT}:${SMTP_USER}`;
  if (cachedTransporter && cachedTransporterKey === key) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  cachedTransporterKey = key;
  return cachedTransporter;
}

async function sendEmail({ to, subject, html }) {
  const transporter = getTransporter();

  if (!transporter) {
    // eslint-disable-next-line no-console
    console.log('\n========== [Email — SMTP CHƯA CẤU HÌNH, in ra console] ==========');
    // eslint-disable-next-line no-console
    console.log(`Đến: ${to}\nTiêu đề: ${subject}\n\n${html}`);
    // eslint-disable-next-line no-console
    console.log('===================================================================\n');
    return { delivered: false, viaConsole: true };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"PetCare System" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
  return { delivered: true, viaConsole: false };
}

function buildVerificationEmailHtml(user, rawToken) {
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${frontendUrl}/verify-email?token=${rawToken}`;
  return `
    <p>Xin chào ${user.fullName},</p>
    <p>Vui lòng bấm vào liên kết bên dưới để xác thực địa chỉ email của bạn:</p>
    <p><a href="${link}">${link}</a></p>
    <p>Liên kết có hiệu lực trong 24 giờ.</p>
    <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
  `;
}

function buildPasswordResetEmailHtml(user, rawToken) {
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${frontendUrl}/reset-password?token=${rawToken}`;
  return `
    <p>Xin chào ${user.fullName},</p>
    <p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản này. Bấm vào liên kết bên dưới để đặt mật khẩu mới:</p>
    <p><a href="${link}">${link}</a></p>
    <p>Liên kết có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
  `;
}

async function sendVerificationEmail(user, rawToken) {
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${frontendUrl}/verify-email?token=${rawToken}`;
  const result = await sendEmail({
    to: user.email,
    subject: 'Xác thực địa chỉ email — PetCare System',
    html: buildVerificationEmailHtml(user, rawToken),
  });
  return { ...result, link };
}

async function sendPasswordResetEmail(user, rawToken) {
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${frontendUrl}/reset-password?token=${rawToken}`;
  const result = await sendEmail({
    to: user.email,
    subject: 'Đặt lại mật khẩu — PetCare System',
    html: buildPasswordResetEmailHtml(user, rawToken),
  });
  return { ...result, link };
}

/**
 * Step 18A (mục 6) — Email xác nhận đơn hàng, gửi ngay sau khi
 * checkout() tạo Order thành công. Cùng nguyên tắc "không chặn luồng
 * chính" như 2 hàm gửi email ở trên: SMTP chưa cấu hình thì chỉ in ra
 * console (dev), KHÔNG báo lỗi cho user (đơn hàng vẫn đã đặt thành công).
 */
function buildOrderConfirmationEmailHtml(user, order) {
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${frontendUrl}/orders`;
  const itemsHtml = order.items
    .map(
      (item) =>
        `<li>${item.name} — SL: ${item.quantity} × ${item.price.toLocaleString('vi-VN')}đ</li>`
    )
    .join('');

  return `
    <p>Xin chào ${user.fullName},</p>
    <p>Cảm ơn bạn đã đặt hàng tại PetCare System. Đơn hàng của bạn đã được ghi nhận:</p>
    <p><strong>Mã đơn hàng:</strong> ${order.orderCode}</p>
    <ul>${itemsHtml}</ul>
    <p><strong>Tổng thanh toán:</strong> ${order.finalAmount.toLocaleString('vi-VN')}đ</p>
    <p><strong>Địa chỉ giao hàng:</strong> ${order.address}</p>
    <p>Xem chi tiết đơn hàng tại: <a href="${link}">${link}</a></p>
  `;
}

async function sendOrderConfirmationEmail(user, order) {
  return sendEmail({
    to: user.email,
    subject: `Xác nhận đơn hàng ${order.orderCode} — PetCare System`,
    html: buildOrderConfirmationEmailHtml(user, order),
  });
}

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendOrderConfirmationEmail };
