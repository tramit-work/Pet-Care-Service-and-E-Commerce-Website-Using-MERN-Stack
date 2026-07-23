const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS } = require('../constants');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Không tìm thấy token xác thực');
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Tài khoản không tồn tại');
  }
  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Tài khoản đã bị khóa');
  }

  req.user = user;
  next();
});

function authorize(...roles) {
  return function checkRole(req, res, next) {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Chưa xác thực');
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Bạn không có quyền thực hiện hành động này');
    }
    next();
  };
}

module.exports = { authenticate, authorize };
