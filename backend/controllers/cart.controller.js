const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants');

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

function buildCartResponse(cart) {
  let totalQuantity = 0;
  let totalAmount = 0;

  const items = cart.items.map((item) => {
    const product = item.product;
    const lineTotal = product ? product.price * item.quantity : 0;
    totalQuantity += item.quantity;
    totalAmount += lineTotal;

    return {
      _id: item._id,
      product,
      quantity: item.quantity,
      lineTotal,
    };
  });

  return {
    _id: cart._id,
    user: cart.user,
    items,
    totalQuantity,
    totalAmount,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate('items.product');

  const validItems = cart.items.filter((item) => item.product !== null);
  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  res.status(HTTP_STATUS.OK).json({ success: true, data: buildCartResponse(cart) });
});

const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = quantity || 1;

  const product = await Product.findOne({ _id: productId, status: 'active' });
  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh');
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((item) => String(item.product) === String(productId));
  const newQuantity = existingItem ? existingItem.quantity + qty : qty;

  if (newQuantity > product.stock) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Chỉ còn ${product.stock} sản phẩm trong kho, không thể thêm ${newQuantity} vào giỏ hàng`
    );
  }

  if (existingItem) {
    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({ product: productId, quantity: qty });
  }

  await cart.save();
  await cart.populate('items.product');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Đã thêm vào giỏ hàng',
    data: buildCartResponse(cart),
  });
});

const updateItemQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await getOrCreateCart(req.user._id);
  const itemIndex = cart.items.findIndex((item) => String(item.product) === String(productId));

  if (itemIndex === -1) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sản phẩm không có trong giỏ hàng');
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {

    const product = await Product.findById(productId);
    if (product && quantity > product.stock) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Chỉ còn ${product.stock} sản phẩm trong kho, không thể đặt số lượng ${quantity}`
      );
    }
    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Đã cập nhật giỏ hàng',
    data: buildCartResponse(cart),
  });
});

const removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await getOrCreateCart(req.user._id);
  const itemIndex = cart.items.findIndex((item) => String(item.product) === String(productId));

  if (itemIndex === -1) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sản phẩm không có trong giỏ hàng');
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();
  await cart.populate('items.product');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Đã xóa khỏi giỏ hàng',
    data: buildCartResponse(cart),
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Đã xóa toàn bộ giỏ hàng',
    data: buildCartResponse(cart),
  });
});

module.exports = { getCart, addItem, updateItemQuantity, removeItem, clearCart };
