const mongoose = require('mongoose');
const {
  ORDER_STATUS,
  ORDER_STATUS_VALUES,
  PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
} = require('../constants/order');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUS_VALUES },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
    },
    clientRequestId: {
      type: String,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm',
      },
    },
    totalAmount: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    receiverName: { type: String, required: [true, 'Họ tên người nhận là bắt buộc'], trim: true },
    phone: { type: String, required: [true, 'Số điện thoại là bắt buộc'], trim: true },
    address: { type: String, required: [true, 'Địa chỉ là bắt buộc'], trim: true },
    note: { type: String, default: '', trim: true },
    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHOD_VALUES,
        message: `Phương thức thanh toán phải là một trong: ${PAYMENT_METHOD_VALUES.join(', ')}`,
      },
      required: [true, 'Phương thức thanh toán là bắt buộc'],
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUS.UNPAID,
    },
    orderStatus: {
      type: String,
      enum: {
        values: ORDER_STATUS_VALUES,
        message: `Trạng thái đơn hàng phải là một trong: ${ORDER_STATUS_VALUES.join(', ')}`,
      },
      default: ORDER_STATUS.PENDING,
    },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, clientRequestId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Order', orderSchema);
