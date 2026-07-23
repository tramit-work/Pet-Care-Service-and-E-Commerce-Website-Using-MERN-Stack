const rateLimit = require('express-rate-limit');
const { HTTP_STATUS } = require('../constants');

function buildLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: message || 'Bạn đã thao tác quá nhiều lần, vui lòng thử lại sau.',
        details: null,
      });
    },
  });
}

// Áp dụng cho TOÀN BỘ /api/* — chặn lạm dụng ở mức thô, rộng.
const generalApiLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 300,
});

// Đăng nhập (User + Admin) — chặt hơn hẳn, chống dò mật khẩu (brute-force).
const loginLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.',
});

// Đăng ký — chặn tạo tài khoản hàng loạt.
const registerLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Bạn đã đăng ký quá nhiều lần. Vui lòng thử lại sau.',
});

// Quên mật khẩu / Gửi lại email xác thực — chặn spam gửi email.
const emailActionLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.',
});

module.exports = { generalApiLimiter, loginLimiter, registerLimiter, emailActionLimiter };
