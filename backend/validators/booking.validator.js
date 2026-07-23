const { body, query } = require('express-validator');
const { STATUS_VALUES, SERVICE_VALUES } = require('../constants/booking');

const customerNameRule = (optional) => {
  const rule = body('customerName').trim();
  return (optional ? rule.optional() : rule.notEmpty().withMessage('Họ tên là bắt buộc')).bail();
};

const phoneRule = (optional) => {
  const rule = body('phone').trim();
  return (optional ? rule.optional() : rule.notEmpty().withMessage('Số điện thoại là bắt buộc')).bail();
};

const serviceTypeRule = (optional) => {
  const rule = body('serviceType');
  return (optional ? rule.optional() : rule.notEmpty().withMessage('Loại dịch vụ là bắt buộc'))
    .bail()
    .isIn(SERVICE_VALUES)
    .withMessage(`Loại dịch vụ phải là một trong: ${SERVICE_VALUES.join(', ')}`);
};

const bookingDateRule = (optional) => {
  const rule = body('bookingDate');
  return (optional ? rule.optional() : rule.notEmpty().withMessage('Ngày đặt lịch là bắt buộc'))
    .bail()
    .isISO8601()
    .withMessage('Ngày đặt lịch không hợp lệ (định dạng YYYY-MM-DD)');
};

const commonOptionalRules = [
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Email không đúng định dạng'),
  body('pet').optional({ nullable: true }).isMongoId().withMessage('pet không hợp lệ (phải là ObjectId)'),
  body('bookingTime').optional().trim(),
  body('note').optional().trim(),
  // "status" chỉ dùng khi ADMIN cập nhật (updatePetValidator) — bỏ qua nếu
  // client gửi khi tạo mới, controller luôn ép "pending" lúc create.
  body('status').optional().isIn(STATUS_VALUES).withMessage(`Trạng thái phải là một trong: ${STATUS_VALUES.join(', ')}`),
];

const createBookingValidator = [
  customerNameRule(false),
  phoneRule(false),
  serviceTypeRule(false),
  bookingDateRule(false),
  ...commonOptionalRules,
];

const updateBookingValidator = [
  customerNameRule(true),
  phoneRule(true),
  serviceTypeRule(true),
  bookingDateRule(true),
  ...commonOptionalRules,
];

const listBookingsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page phải là số nguyên >= 1'),
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('limit phải là số nguyên từ 1 đến 200'),
  query('status').optional().isIn(STATUS_VALUES).withMessage(`status phải là một trong: ${STATUS_VALUES.join(', ')}`),
  query('serviceType')
    .optional()
    .isIn(SERVICE_VALUES)
    .withMessage(`serviceType phải là một trong: ${SERVICE_VALUES.join(', ')}`),
  query('search').optional().isString().trim(),
  query('sort').optional().isIn(['newest', 'oldest']).withMessage('sort phải là một trong: newest, oldest'),
];

module.exports = { createBookingValidator, updateBookingValidator, listBookingsValidator };
