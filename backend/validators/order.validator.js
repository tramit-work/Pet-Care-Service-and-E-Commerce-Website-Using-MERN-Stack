const { body, param } = require('express-validator');
const { PAYMENT_METHOD_VALUES, ORDER_STATUS_VALUES } = require('../constants/order');


const createOrderValidator = [
  body('receiverName').trim().notEmpty().withMessage('Họ tên người nhận là bắt buộc'),
  body('phone').trim().notEmpty().withMessage('Số điện thoại là bắt buộc'),
  body('address').trim().notEmpty().withMessage('Địa chỉ là bắt buộc'),
  body('note').optional().trim(),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Phương thức thanh toán là bắt buộc')
    .bail()
    .isIn(PAYMENT_METHOD_VALUES)
    .withMessage(`Phương thức thanh toán phải là một trong: ${PAYMENT_METHOD_VALUES.join(', ')}`),

  body('clientRequestId').optional().isString().trim().isLength({ max: 100 }),
];

const orderIdValidator = [param('id').isMongoId().withMessage('id không hợp lệ (phải là ObjectId)')];

const updateStatusValidator = [
  param('id').isMongoId().withMessage('id không hợp lệ (phải là ObjectId)'),
  body('status')
    .notEmpty()
    .withMessage('status là bắt buộc')
    .bail()
    .isIn(ORDER_STATUS_VALUES)
    .withMessage(`status phải là một trong: ${ORDER_STATUS_VALUES.join(', ')}`),
];

module.exports = { createOrderValidator, orderIdValidator, updateStatusValidator };
