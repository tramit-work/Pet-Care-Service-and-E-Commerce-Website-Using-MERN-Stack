const { HTTP_STATUS } = require('../constants');
const ApiError = require('../utils/ApiError');

const DUPLICATE_FIELD_MESSAGES = {
  email: 'Email này đã được sử dụng.',
  googleId: 'Email này đã được đăng ký.',
  name: 'Tên này đã tồn tại, vui lòng chọn tên khác.',
};

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Đã xảy ra lỗi, vui lòng thử lại sau.';
  let details = null;
  let handled = false;

  if (err instanceof ApiError) {
    message = err.message;
    details = err.details || null;
    handled = true;
  }

  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Dữ liệu không hợp lệ.';
    handled = true;
  }

  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = 'Thông tin chưa hợp lệ, vui lòng kiểm tra lại.';
    details = null;
    handled = true;
  }

  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys(err.keyValue || {})[0];
    message = DUPLICATE_FIELD_MESSAGES[field] || 'Dữ liệu đã tồn tại.';
    handled = true;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.';
    handled = true;
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.';
    handled = true;
  }

  if (!handled) {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${req.method} ${req.originalUrl} ->`, err);
  } else {
    console.error(`[Error] ${req.method} ${req.originalUrl} -> ${err.name || 'Error'}: ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
  });
}

module.exports = errorHandler;
