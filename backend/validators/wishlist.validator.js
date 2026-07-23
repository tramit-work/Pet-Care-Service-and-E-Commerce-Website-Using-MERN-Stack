const { body, param } = require('express-validator');
const Product = require('../models/Product');

const addWishlistValidator = [
  body('product')
    .notEmpty()
    .withMessage('product là bắt buộc')
    .bail()
    .isMongoId()
    .withMessage('product không hợp lệ (phải là ObjectId)')
    .bail()
    .custom(async (value) => {
      const exists = await Product.exists({ _id: value });
      if (!exists) {
        throw new Error('Sản phẩm không tồn tại');
      }
      return true;
    }),
];

const removeWishlistValidator = [
  param('productId').isMongoId().withMessage('productId không hợp lệ (phải là ObjectId)'),
];

module.exports = { addWishlistValidator, removeWishlistValidator };
