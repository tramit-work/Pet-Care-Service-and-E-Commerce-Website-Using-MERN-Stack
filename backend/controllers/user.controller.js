const User = require('../models/User');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Wishlist = require('../models/Wishlist');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS, RECORD_STATUS } = require('../constants');

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildUserFilter(query) {
  const { search, role, status } = query;
  const filter = {};

  if (role) filter.role = role;
  if (status === 'active') filter.isActive = true;
  if (status === 'locked') filter.isActive = false;

  if (search) {
    const safePattern = escapeRegex(search);
    filter.$or = [
      { fullName: { $regex: safePattern, $options: 'i' } },
      { email: { $regex: safePattern, $options: 'i' } },
    ];
  }

  return filter;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

/**
 * GET /api/admin/users
 * Chỉ ADMIN (đã bọc ở router — xem admin.routes.js).
 */
const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT);

  const filter = buildUserFilter(req.query);

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      totalItems: total,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

/**
 * GET /api/admin/users/:id
 * Step 16.6: chi tiết 1 user kèm số liệu tổng hợp (đơn hàng/lịch đặt/
 * yêu thích/đánh giá) — User model KHÔNG lưu sẵn các số liệu này (không
 * thêm field đếm vào User, tránh dữ liệu phái sinh dễ lệch), tính trực
 * tiếp từ các collection liên quan mỗi lần xem chi tiết.
 *
 * "Địa chỉ" trong yêu cầu: User model không có field address riêng (chỉ
 * Order mới có, vì địa chỉ giao hàng có thể khác nhau mỗi đơn) — không tự
 * thêm field mới vào User (tránh field luôn rỗng vì chưa có nơi nào cho
 * User tự nhập) — hiển thị tạm địa chỉ từ ĐƠN HÀNG GẦN NHẤT của họ, ghi rõ
 * nguồn gốc ở Frontend.
 */
const getUserDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy người dùng');
  }

  const [orderCount, bookingCount, wishlistCount, reviewCount, latestOrder] = await Promise.all([
    Order.countDocuments({ user: user._id }),
    Booking.countDocuments({ createdBy: user._id }),
    Wishlist.countDocuments({ user: user._id }),
    Review.countDocuments({ user: user._id, status: RECORD_STATUS.ACTIVE }),
    Order.findOne({ user: user._id }).sort({ createdAt: -1 }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      user,
      stats: {
        orders: orderCount,
        bookings: bookingCount,
        wishlist: wishlistCount,
        reviews: reviewCount,
      },
      lastOrderAddress: latestOrder?.address || null,
    },
  });
});

/**
 * PUT /api/admin/users/:id/role
 * Không cho Admin tự đổi role của CHÍNH MÌNH (tránh tự hạ quyền/tự khóa
 * quyền admin của mình theo đúng yêu cầu).
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (String(id) === String(req.user._id)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Không thể tự đổi vai trò của chính mình');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy người dùng');
  }

  user.role = role;
  await user.save();

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Đã cập nhật vai trò', data: user });
});

/**
 * PUT /api/admin/users/:id/status
 * Không cho Admin tự khóa/mở khóa CHÍNH MÌNH — cùng nguyên tắc an toàn với
 * việc không cho tự đổi role, tránh tự khóa mất quyền truy cập của mình.
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (String(id) === String(req.user._id)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Không thể tự khóa/mở khóa chính mình');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy người dùng');
  }

  user.isActive = isActive;
  await user.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản',
    data: user,
  });
});

module.exports = { listUsers, getUserDetail, updateUserRole, updateUserStatus };
