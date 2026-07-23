const { body, param } = require('express-validator');
const Product = require('../models/Product');
const { MIN_QUANTITY } = require('../constants/cart');

const addItemValidator = [
  body('productId')
    .notEmpty()
    .withMessage('productId là bắt buộc')
    .bail()
    .isMongoId()
    .withMessage('productId không hợp lệ (phải là ObjectId)')
    .bail()
    .custom(async (value) => {
      const exists = await Product.exists({ _id: value });
      if (!exists) {
        throw new Error('Sản phẩm không tồn tại');
      }
      return true;
    }),
  body('quantity')
    .optional()
    .isInt({ min: MIN_QUANTITY })
    .withMessage(`Số lượng phải là số nguyên >= ${MIN_QUANTITY}`),
];

const updateItemValidator = [
  param('productId').isMongoId().withMessage('productId không hợp lệ (phải là ObjectId)'),
  body('quantity').notEmpty().withMessage('quantity là bắt buộc').bail().isInt().withMessage('quantity phải là số nguyên'),
];

const removeItemValidator = [
  param('productId').isMongoId().withMessage('productId không hợp lệ (phải là ObjectId)'),
];

module.exports = { addItemValidator, updateItemValidator, removeItemValidator };
