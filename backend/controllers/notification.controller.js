const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

async function createNotification({ user, type, title, message, link = '' }) {
  try {
    await Notification.create({ user, type, title, message, link });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Notification] Tạo thông báo thất bại:', err.message);
  }
}

const listNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT);
  const filter = { user: req.user._id };

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, isRead: false }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: items,
    unreadCount,
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
 * PUT /api/notifications/:id/read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy thông báo');
  }
  if (String(notification.user) !== String(req.user._id)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Bạn không có quyền với thông báo này');
  }

  notification.isRead = true;
  await notification.save();

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Đã đánh dấu đã đọc', data: notification });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Đã đánh dấu tất cả đã đọc' });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy thông báo');
  }
  if (String(notification.user) !== String(req.user._id)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Bạn không có quyền với thông báo này');
  }

  await notification.deleteOne();
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Đã xóa thông báo' });
});

module.exports = { createNotification, listNotifications, markAsRead, markAllAsRead, deleteNotification };
