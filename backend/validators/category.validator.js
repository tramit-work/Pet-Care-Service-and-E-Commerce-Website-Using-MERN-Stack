const { body, query } = require('express-validator');
const { STATUS_VALUES } = require('../constants/status');

const nameRule = (optional) => {
  const rule = body('name').trim();
  return (optional ? rule.optional() : rule.notEmpty().withMessage('Tên danh mục là bắt buộc')).bail();
};

const commonOptionalRules = [
  body('description').optional().trim(),
  body('image').optional().trim(),
  body('icon').optional().trim(),
  body('displayOrder').optional().isInt().withMessage('Thứ tự hiển thị phải là số nguyên'),
  // Hardening Step 11: field mới ở Category Model.
  body('isFeatured').optional().isBoolean().withMessage('isFeatured phải là true/false'),
  body('status')
    .optional()
    .isIn(STATUS_VALUES)
    .withMessage(`Trạng thái phải là một trong: ${STATUS_VALUES.join(', ')}`),
];

const createCategoryValidator = [nameRule(false), ...commonOptionalRules];

const updateCategoryValidator = [nameRule(true), ...commonOptionalRules];

const listCategoriesValidator = [
  query('status').optional().isIn(STATUS_VALUES).withMessage(`status phải là một trong: ${STATUS_VALUES.join(', ')}`),
];

module.exports = { createCategoryValidator, updateCategoryValidator, listCategoriesValidator };
