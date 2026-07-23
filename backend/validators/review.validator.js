const { body, param, query } = require('express-validator');
const { STATUS_VALUES } = require('../constants/status');

const listPublicReviewsValidator = [
  query('product').isMongoId().withMessage('product là bắt buộc và phải là ObjectId hợp lệ'),
  query('order').optional().isMongoId().withMessage('order phải là ObjectId hợp lệ'),
];

const createReviewValidator = [
  body('order').isMongoId().withMessage('order là bắt buộc và phải là ObjectId hợp lệ'),
  body('product').isMongoId().withMessage('product là bắt buộc và phải là ObjectId hợp lệ'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('rating phải là số nguyên từ 1 đến 5'),
  body('comment').trim().notEmpty().withMessage('Nội dung đánh giá là bắt buộc'),
];

const updateReviewValidator = [
  param('id').isMongoId().withMessage('id không hợp lệ (phải là ObjectId)'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('rating phải là số nguyên từ 1 đến 5'),
  body('comment').optional().trim().notEmpty().withMessage('Nội dung đánh giá không được để trống'),
];

const updateReviewStatusValidator = [
  param('id').isMongoId().withMessage('id không hợp lệ (phải là ObjectId)'),
  body('status')
    .notEmpty()
    .withMessage('status là bắt buộc')
    .bail()
    .isIn(STATUS_VALUES)
    .withMessage(`status phải là một trong: ${STATUS_VALUES.join(', ')}`),
];

const reviewIdValidator = [param('id').isMongoId().withMessage('id không hợp lệ (phải là ObjectId)')];

module.exports = {
  listPublicReviewsValidator,
  createReviewValidator,
  updateReviewValidator,
  updateReviewStatusValidator,
  reviewIdValidator,
};
