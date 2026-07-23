const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS, ROLES, RECORD_STATUS } = require('../constants');
const { ORDER_STATUS } = require('../constants/order');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function recomputeProductRating(productId) {
  const productObjectId =
    productId instanceof mongoose.Types.ObjectId ? productId : new mongoose.Types.ObjectId(String(productId));

  const stats = await Review.aggregate([
    { $match: { product: productObjectId, status: RECORD_STATUS.ACTIVE } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const avg = stats[0]?.avg || 0;
  const count = stats[0]?.count || 0;

  await Product.findByIdAndUpdate(productObjectId, {
    rating: Math.round(avg * 10) / 10,
    numReviews: count,
  });
}

const listPublicReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT);

  const filter = { product: new mongoose.Types.ObjectId(String(req.query.product)) };

  if (req.query.order) {
    filter.order = new mongoose.Types.ObjectId(String(req.query.order));
  } else {
    filter.status = RECORD_STATUS.ACTIVE;
  }

  const [items, total, distribution] = await Promise.all([
    Review.find(filter)
      .populate('user', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments(filter),
    Review.aggregate([{ $match: filter }, { $group: { _id: '$rating', count: { $sum: 1 } } }]),
  ]);

  const distMap = new Map(distribution.map((d) => [d._id, d.count]));
  const summary = {
    average: total > 0 ? Math.round((distribution.reduce((s, d) => s + d._id * d.count, 0) / total) * 10) / 10 : 0,
    total,
    distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: distMap.get(star) || 0 })),
  };

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: items,
    summary,
    pagination: {
      page,
      limit,
      totalItems: total,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

const listAdminReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT);
  const { status, rating, search } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (rating) filter.rating = parseInt(rating, 10);
  if (search) {
    filter.comment = { $regex: escapeRegex(search), $options: 'i' };
  }

  const [items, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'fullName email avatar')
      .populate('product', 'name image')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments(filter),
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

const getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'fullName email avatar')
    .populate('product', 'name image');

  if (!review) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy đánh giá');
  }
  if (req.user.role !== ROLES.ADMIN && String(review.user._id) !== String(req.user._id)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Bạn không có quyền xem đánh giá này');
  }

  res.status(HTTP_STATUS.OK).json({ success: true, data: review });
});

const createReview = asyncHandler(async (req, res) => {
  const { order: orderId, product: productId, rating, comment } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }
  if (String(order.user) !== String(req.user._id)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Bạn không có quyền đánh giá từ đơn hàng này');
  }
  if (order.orderStatus !== ORDER_STATUS.COMPLETED) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Chỉ có thể đánh giá sau khi đơn hàng đã hoàn thành');
  }
  const hasPurchasedProduct = order.items.some((item) => String(item.product) === String(productId));
  if (!hasPurchasedProduct) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Sản phẩm này không có trong đơn hàng đã chọn');
  }

  let review;
  try {
    review = await Review.create({
      product: productId,
      user: req.user._id,
      order: orderId,
      rating,
      comment,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi');
    }
    throw err;
  }

  await recomputeProductRating(productId);

  res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Đánh giá thành công', data: review });
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy đánh giá');
  }
  if (String(review.user) !== String(req.user._id)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Bạn không có quyền sửa đánh giá này');
  }

  const { rating, comment } = req.body;
  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  await review.save();

  await recomputeProductRating(review.product);

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Cập nhật đánh giá thành công', data: review });
});

const updateReviewStatus = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy đánh giá');
  }

  review.status = req.body.status;
  await review.save();
  await recomputeProductRating(review.product);

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Cập nhật trạng thái thành công', data: review });
});

module.exports = {
  listPublicReviews,
  listAdminReviews,
  getReviewById,
  createReview,
  updateReview,
  updateReviewStatus,
};
