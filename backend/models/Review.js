const mongoose = require('mongoose');
const { RECORD_STATUS, STATUS_VALUES } = require('../constants/status');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Số sao đánh giá là bắt buộc'],
      min: [1, 'Số sao tối thiểu là 1'],
      max: [5, 'Số sao tối đa là 5'],
    },
    comment: {
      type: String,
      required: [true, 'Nội dung đánh giá là bắt buộc'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: STATUS_VALUES,
        message: `Trạng thái phải là một trong: ${STATUS_VALUES.join(', ')}`,
      },
      default: RECORD_STATUS.ACTIVE,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
