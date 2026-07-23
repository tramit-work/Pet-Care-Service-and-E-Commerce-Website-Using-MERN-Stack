const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS, ROLES, BOOKING_STATUS } = require('../constants');
const { NOTIFICATION_TYPE } = require('../constants/notification');
const { createNotification } = require('./notification.controller');

const BOOKING_STATUS_LABELS_VI = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const ALLOWED_TRANSITIONS = {
  [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.COMPLETED]: [],
  [BOOKING_STATUS.CANCELLED]: [],
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 100;

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildBookingFilter(req) {
  const { status, serviceType, search } = req.query;
  const filter = {};

  if (req.user.role !== ROLES.ADMIN) {
    filter.createdBy = req.user._id;
  }

  if (status) filter.status = status;
  if (serviceType) filter.serviceType = serviceType;

  if (search) {
    const safePattern = escapeRegex(search);
    filter.$or = [
      { customerName: { $regex: safePattern, $options: 'i' } },
      { phone: { $regex: safePattern, $options: 'i' } },
      { email: { $regex: safePattern, $options: 'i' } },
    ];
  }

  return filter;
}

function buildBookingSort(sort) {
  return sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
}

const listBookings = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT);

  const filter = buildBookingFilter(req);
  const sort = buildBookingSort(req.query.sort);

  const [items, total] = await Promise.all([
    Booking.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Booking.countDocuments(filter),
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

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy booking');
  }

  if (req.user.role !== ROLES.ADMIN && String(booking.createdBy) !== String(req.user._id)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Bạn không có quyền xem booking này');
  }

  res.status(HTTP_STATUS.OK).json({ success: true, data: booking });
});

const createBooking = asyncHandler(async (req, res) => {
  const { customerName, phone, email, serviceType, pet, bookingDate, bookingTime, note } = req.body;

  const booking = await Booking.create({
    customerName,
    phone,
    email,
    serviceType,
    pet: pet || null,
    bookingDate,
    bookingTime,
    note,
    status: BOOKING_STATUS.PENDING,
    statusHistory: [{ status: BOOKING_STATUS.PENDING, updatedAt: new Date(), updatedBy: req.user._id }],
    createdBy: req.user._id,
  });

  await createNotification({
    user: req.user._id,
    type: NOTIFICATION_TYPE.BOOKING_CREATED,
    title: 'Đặt lịch thành công',
    message: `Lịch đặt dịch vụ "${serviceType}" đã được ghi nhận, đang chờ xác nhận.`,
    link: '/service',
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Đặt lịch thành công',
    data: booking,
  });
});

const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy booking');
  }

  const { status, ...rest } = req.body;
  Object.assign(booking, rest);

  const statusChanged = Boolean(status) && status !== booking.status;
  if (statusChanged) {
    const allowedNext = ALLOWED_TRANSITIONS[booking.status] || [];
    if (!allowedNext.includes(status)) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Không thể chuyển trạng thái từ "${booking.status}" sang "${status}"`
      );
    }
    booking.status = status;
    booking.statusHistory.push({ status, updatedAt: new Date(), updatedBy: req.user._id });
  }

  await booking.save();

  if (statusChanged) {
    await createNotification({
      user: booking.createdBy,
      type: NOTIFICATION_TYPE.BOOKING_STATUS,
      title: 'Lịch đặt cập nhật trạng thái',
      message: `Lịch đặt dịch vụ "${booking.serviceType}" đã chuyển sang trạng thái "${
        BOOKING_STATUS_LABELS_VI[booking.status] || booking.status
      }".`,
      link: '/service',
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Cập nhật booking thành công',
    data: booking,
  });
});

const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy booking');
  }

  await booking.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Xóa booking thành công',
  });
});

module.exports = {
  listBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
};
