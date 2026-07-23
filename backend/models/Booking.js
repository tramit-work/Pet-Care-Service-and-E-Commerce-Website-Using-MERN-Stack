const mongoose = require('mongoose');
const { BOOKING_STATUS, STATUS_VALUES, SERVICE_VALUES } = require('../constants/booking');


const bookingSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Họ tên là bắt buộc'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    serviceType: {
      type: String,
      required: [true, 'Loại dịch vụ là bắt buộc'],
      enum: {
        values: SERVICE_VALUES,
        message: `Loại dịch vụ phải là một trong: ${SERVICE_VALUES.join(', ')}`,
      },
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      default: null,
    },
    bookingDate: {
      type: Date,
      required: [true, 'Ngày đặt lịch là bắt buộc'],
    },
    bookingTime: {
      type: String,
      default: '',
      trim: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: STATUS_VALUES,
        message: `Trạng thái phải là một trong: ${STATUS_VALUES.join(', ')}`,
      },
      default: BOOKING_STATUS.PENDING,
    },

    statusHistory: [
      {
        status: {
          type: String,
          enum: STATUS_VALUES,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
