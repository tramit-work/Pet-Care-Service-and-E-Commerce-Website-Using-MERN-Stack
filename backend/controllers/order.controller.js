const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS, ROLES } = require('../constants');
const { ORDER_STATUS, SHIPPING_FEE_BY_PAYMENT_METHOD } = require('../constants/order');
const { NOTIFICATION_TYPE } = require('../constants/notification');
const { createNotification } = require('./notification.controller');
const { sendOrderConfirmationEmail } = require('../utils/email');

const ORDER_STATUS_LABELS_VI = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const ALLOWED_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function generateOrderCode(session) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const datePrefix = `ORD${y}${m}${d}`;

  const query = Order.countDocuments({ orderCode: { $regex: `^${datePrefix}` } });
  const countToday = session ? await query.session(session) : await query;
  const seq = String(countToday + 1).padStart(4, '0');

  return `${datePrefix}${seq}`;
}

function buildOrderFilter(req) {
  const { status, search } = req.query;
  const filter = {};

  if (req.user.role !== ROLES.ADMIN) {
    filter.user = req.user._id;
  }

  if (status) filter.orderStatus = status;

  if (search) {
    const safePattern = escapeRegex(search);
    filter.$or = [
      { orderCode: { $regex: safePattern, $options: 'i' } },
      { receiverName: { $regex: safePattern, $options: 'i' } },
      { phone: { $regex: safePattern, $options: 'i' } },
    ];
  }

  return filter;
}

function buildOrderSort(sort) {
  return sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
}

const listOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT);

  const filter = buildOrderFilter(req);
  const sort = buildOrderSort(req.query.sort);

  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'email fullName')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
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

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'email fullName');

  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }

  if (req.user.role !== ROLES.ADMIN && String(order.user._id) !== String(req.user._id)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Bạn không có quyền xem đơn hàng này');
  }

  res.status(HTTP_STATUS.OK).json({ success: true, data: order });
});

const checkout = asyncHandler(async (req, res) => {
  const { receiverName, phone, address, note, paymentMethod, clientRequestId } = req.body;

  if (clientRequestId) {
    const existingOrder = await Order.findOne({ user: req.user._id, clientRequestId });
    if (existingOrder) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Đơn hàng đã được tạo trước đó',
        data: existingOrder,
      });
    }
  }

  const session = await mongoose.startSession();
  let useTransaction = true;
  try {
    session.startTransaction();
  } catch (err) {
    useTransaction = false;
  }

  const compensations = [];

  try {
    const cart = await (() => {
      const q = Cart.findOne({ user: req.user._id }).populate('items.product');
      return useTransaction ? q.session(session) : q;
    })();

    if (!cart || cart.items.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Giỏ hàng đang trống');
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Một số sản phẩm trong giỏ không còn tồn tại');
      }
      if (item.quantity > product.stock) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          `Sản phẩm "${product.name}" không đủ tồn kho (còn ${product.stock})`
        );
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
      totalAmount += product.price * item.quantity;
    }

    const shippingFee = SHIPPING_FEE_BY_PAYMENT_METHOD[paymentMethod] ?? 0;
    const discount = 0;
    const finalAmount = totalAmount + shippingFee - discount;
    const orderCode = await generateOrderCode(useTransaction ? session : null);

    const created = await Order.create(
      [
        {
          orderCode,
          clientRequestId: clientRequestId || null,
          user: req.user._id,
          items: orderItems,
          totalAmount,
          shippingFee,
          discount,
          finalAmount,
          receiverName,
          phone,
          address,
          note,
          paymentMethod,
          orderStatus: ORDER_STATUS.PENDING,
          statusHistory: [{ status: ORDER_STATUS.PENDING, updatedAt: new Date(), updatedBy: req.user._id }],
        },
      ],
      useTransaction ? { session } : {}
    );
    const order = created[0];
    if (!useTransaction) {
      compensations.push(async () => Order.deleteOne({ _id: order._id }));
    }

    for (const item of cart.items) {
      const productId = item.product._id;
      const qty = item.quantity;
      await Product.updateOne(
        { _id: productId },
        { $inc: { stock: -qty, sold: qty } },
        useTransaction ? { session } : {}
      );
      if (!useTransaction) {
        compensations.push(async () => Product.updateOne({ _id: productId }, { $inc: { stock: qty, sold: -qty } }));
      }
    }

    const previousItems = cart.items.map((i) => ({ product: i.product._id, quantity: i.quantity }));
    cart.items = [];
    if (useTransaction) {
      await cart.save({ session });
    } else {
      await cart.save();
      compensations.push(async () => {
        const freshCart = await Cart.findById(cart._id);
        freshCart.items = previousItems;
        await freshCart.save();
      });
    }

    if (useTransaction) {
      await session.commitTransaction();
    }

    await createNotification({
      user: req.user._id,
      type: NOTIFICATION_TYPE.ORDER_CREATED,
      title: 'Đặt hàng thành công',
      message: `Đơn hàng ${order.orderCode} đã được tạo, đang chờ xác nhận.`,
      link: '/orders',
    });

    await sendOrderConfirmationEmail(req.user, order);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: order,
    });
  } catch (err) {
    if (useTransaction) {
      await session.abortTransaction();
    } else {

      for (const undo of compensations.reverse()) {

        await undo().catch(() => {});
      }
    }

    if (err.code === 11000 && clientRequestId && (err.keyPattern?.clientRequestId || err.keyValue?.clientRequestId)) {
      const existingOrder = await Order.findOne({ user: req.user._id, clientRequestId });
      if (existingOrder) {
        return res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'Đơn hàng đã được tạo trước đó',
          data: existingOrder,
        });
      }
    }

    throw err;
  } finally {
    session.endSession();
  }
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }

  const isOwner = String(order.user) === String(req.user._id);
  if (req.user.role !== ROLES.ADMIN && !isOwner) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Bạn không có quyền hủy đơn hàng này');
  }

  if (order.orderStatus !== ORDER_STATUS.PENDING) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Chỉ có thể hủy đơn khi đang ở trạng thái chờ xác nhận');
  }

  for (const item of order.items) {
    if (item.product) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity, sold: -item.quantity } });
    }
  }

  order.orderStatus = ORDER_STATUS.CANCELLED;
  order.statusHistory.push({ status: ORDER_STATUS.CANCELLED, updatedAt: new Date(), updatedBy: req.user._id });
  await order.save();

  await createNotification({
    user: order.user,
    type: NOTIFICATION_TYPE.ORDER_STATUS,
    title: 'Đơn hàng đã hủy',
    message: `Đơn hàng ${order.orderCode} đã được hủy.`,
    link: '/orders',
  });

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Đã hủy đơn hàng', data: order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }

  const { status } = req.body;

  if (status === order.orderStatus) {
    return res.status(HTTP_STATUS.OK).json({ success: true, message: 'Không có thay đổi', data: order });
  }

  const allowedNext = ALLOWED_TRANSITIONS[order.orderStatus] || [];
  if (!allowedNext.includes(status)) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `Không thể chuyển trạng thái từ "${order.orderStatus}" sang "${status}"`
    );
  }

  if (status === ORDER_STATUS.CANCELLED && order.orderStatus !== ORDER_STATUS.CANCELLED) {
    for (const item of order.items) {
      if (item.product) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity, sold: -item.quantity } });
      }
    }
  }

  order.orderStatus = status;
  order.statusHistory.push({ status, updatedAt: new Date(), updatedBy: req.user._id });
  await order.save();

  await createNotification({
    user: order.user,
    type: NOTIFICATION_TYPE.ORDER_STATUS,
    title: 'Đơn hàng cập nhật trạng thái',
    message: `Đơn hàng ${order.orderCode} đã chuyển sang trạng thái "${ORDER_STATUS_LABELS_VI[status] || status}".`,
    link: '/orders',
  });

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Cập nhật trạng thái thành công', data: order });
});

module.exports = { listOrders, getOrderById, checkout, cancelOrder, updateOrderStatus };
