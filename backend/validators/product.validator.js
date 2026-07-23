const { body, query } = require('express-validator');
const { STATUS_VALUES } = require('../constants');
const Category = require('../models/Category');

const SORT_VALUES = [
  'price_asc',
  'price_desc',
  'newest',
  'oldest',
  'rating',
  'featured',
  'price-low',
  'price-high',
];

const nameRule = (optional) => {
  const rule = body('name').trim();
  return (optional ? rule.optional() : rule.notEmpty().withMessage('Tên sản phẩm là bắt buộc')).bail();
};

const categoryRule = (optional) => {
  const rule = body('category');
  return (optional ? rule.optional() : rule.notEmpty().withMessage('Danh mục là bắt buộc'))
    .bail()
    .isMongoId()
    .withMessage('Danh mục không hợp lệ (phải là ObjectId của Category)')
    .bail()
    .custom(async (value) => {
      const exists = await Category.exists({ _id: value });
      if (!exists) {
        throw new Error('Danh mục không tồn tại');
      }
      return true;
    });
};

const priceRule = (field, label, optional) => {
  const rule = body(field);
  return (optional ? rule.optional({ nullable: true }) : rule.notEmpty().withMessage(`${label} là bắt buộc`))
    .bail()
    .isFloat({ min: 0 })
    .withMessage(`${label} phải là số không âm`);
};

const imageRule = (optional) => {
  const rule = body('image').trim();
  return (optional ? rule.optional() : rule.notEmpty().withMessage('Ảnh sản phẩm là bắt buộc')).bail();
};

const commonOptionalRules = [
  body('description').optional().trim(),
  body('brand').optional().trim(),
  body('stock').optional().isInt({ min: 0 }).withMessage('Tồn kho phải là số nguyên không âm'),
  body('gallery').optional().isArray().withMessage('Gallery phải là mảng URL ảnh'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Đánh giá phải từ 0 đến 5'),
  body('isNewArrival').optional().isBoolean().withMessage('isNewArrival phải là true/false'),
  body('isSale').optional().isBoolean().withMessage('isSale phải là true/false'),
  body('featured').optional().isBoolean().withMessage('featured phải là true/false'),
  body('status').optional().isIn(STATUS_VALUES).withMessage(`Trạng thái phải là một trong: ${STATUS_VALUES.join(', ')}`),
  // Hardening Step 10: 2 field mới ở Product Model.
  body('sold').optional().isInt({ min: 0 }).withMessage('Số lượng đã bán phải là số nguyên không âm'),
  body('numReviews').optional().isInt({ min: 0 }).withMessage('Số lượng đánh giá phải là số nguyên không âm'),
];

const createProductValidator = [
  nameRule(false),
  categoryRule(false),
  priceRule('price', 'Giá', false),
  priceRule('originalPrice', 'Giá gốc', true),
  imageRule(false),
  ...commonOptionalRules,
];

const updateProductValidator = [
  nameRule(true),
  categoryRule(true),
  priceRule('price', 'Giá', true),
  priceRule('originalPrice', 'Giá gốc', true),
  imageRule(true),
  ...commonOptionalRules,
];

/**
 * Hardening Step 10: validator cho query string của GET /api/products —
 * trước đây endpoint này (dù đã đọc page/limit/category/search/sort trong
 * controller) chưa hề validate query, nghĩa là ai gửi page=abc hay
 * limit=-5 cũng lọt qua tới tận controller. Validate ở đây sớm, trả lỗi
 * 422 rõ ràng thay vì để controller tự "chữa cháy" bằng parseInt/Math.max.
 *
 * Step 11: `category` giờ chấp nhận CẢ ObjectId lẫn slug (chuỗi thường,
 * không phải enum cố định nữa) — nên chỉ validate là chuỗi không rỗng,
 * việc "có tồn tại hay không" để controller (resolveCategoryId) xử lý.
 */
const listProductsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page phải là số nguyên >= 1'),
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('limit phải là số nguyên từ 1 đến 200'),
  query('category').optional().isString().trim().notEmpty().withMessage('category không được để trống'),
  query('search').optional().isString().trim(),
  query('sort').optional().isIn(SORT_VALUES).withMessage(`sort phải là một trong: ${SORT_VALUES.join(', ')}`),
];

module.exports = { createProductValidator, updateProductValidator, listProductsValidator };
