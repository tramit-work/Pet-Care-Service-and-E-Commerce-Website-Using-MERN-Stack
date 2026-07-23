const Wishlist = require('../models/Wishlist');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants');

const listWishlist = asyncHandler(async (req, res) => {
  const items = await Wishlist.find({ user: req.user._id })
    .populate('product')
    .sort({ createdAt: -1 });

  const orphanedIds = items.filter((item) => item.product === null).map((item) => item._id);
  if (orphanedIds.length > 0) {
    await Wishlist.deleteMany({ _id: { $in: orphanedIds } });
  }
  const validItems = items.filter((item) => item.product !== null);

  res.status(HTTP_STATUS.OK).json({ success: true, data: validItems });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { product } = req.body;

  const existing = await Wishlist.findOne({ user: req.user._id, product });
  if (existing) {
    await existing.populate('product');
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Sản phẩm đã có trong danh sách yêu thích',
      data: existing,
    });
  }

  const created = await Wishlist.create({ user: req.user._id, product });
  await created.populate('product');

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Đã thêm vào danh sách yêu thích',
    data: created,
  });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const removed = await Wishlist.findOneAndDelete({
    user: req.user._id,
    product: req.params.productId,
  });

  if (!removed) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sản phẩm không có trong danh sách yêu thích');
  }

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Đã xóa khỏi danh sách yêu thích' });
});

module.exports = { listWishlist, addToWishlist, removeFromWishlist };
