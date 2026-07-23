const { body, query } = require('express-validator');
const { SPECIES_VALUES, GENDER_VALUES, ADOPTION_STATUS_VALUES, STATUS_VALUES } = require('../constants');

const SORT_VALUES = ['price_asc', 'price_desc', 'newest', 'oldest', 'rating', 'featured', 'price-low', 'price-high'];

const nameRule = (optional) => {
  const rule = body('name').trim();
  return (optional ? rule.optional() : rule.notEmpty().withMessage('Tên thú cưng là bắt buộc')).bail();
};

const speciesRule = (optional) => {
  const rule = body('species');
  return (optional ? rule.optional() : rule.notEmpty().withMessage('Giống loài là bắt buộc'))
    .bail()
    .isIn(SPECIES_VALUES)
    .withMessage(`Giống loài phải là một trong: ${SPECIES_VALUES.join(', ')}`);
};

const priceRule = (optional) => {
  const rule = body('price');
  return (optional ? rule.optional({ nullable: true }) : rule.notEmpty().withMessage('Giá là bắt buộc'))
    .bail()
    .isFloat({ min: 0 })
    .withMessage('Giá phải là số không âm');
};

const imageRule = (optional) => {
  const rule = body('image').trim();
  return (optional ? rule.optional() : rule.notEmpty().withMessage('Ảnh thú cưng là bắt buộc')).bail();
};

const commonOptionalRules = [
  body('breed').optional().trim(),
  body('gender').optional().isIn(GENDER_VALUES).withMessage(`Giới tính phải là một trong: ${GENDER_VALUES.join(', ')}`),
  body('age').optional().isInt({ min: 0 }).withMessage('Tuổi phải là số nguyên không âm'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Cân nặng phải là số không âm'),
  body('color').optional().trim(),
  body('description').optional().trim(),
  body('gallery').optional().isArray().withMessage('Gallery phải là mảng URL ảnh'),
  body('vaccination').optional().isBoolean().withMessage('vaccination phải là true/false'),
  body('healthStatus').optional().trim(),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured phải là true/false'),
  // Hardening Step 12: 2 field mới ở Pet Model, giống Product.
  body('sold').optional().isInt({ min: 0 }).withMessage('Số lượng đã bán phải là số nguyên không âm'),
  body('numReviews').optional().isInt({ min: 0 }).withMessage('Số lượng đánh giá phải là số nguyên không âm'),
  body('microchipId').optional().trim(),
  body('adoptionStatus')
    .optional()
    .isIn(ADOPTION_STATUS_VALUES)
    .withMessage(`Trạng thái nhận nuôi phải là một trong: ${ADOPTION_STATUS_VALUES.join(', ')}`),
  body('status').optional().isIn(STATUS_VALUES).withMessage(`Trạng thái phải là một trong: ${STATUS_VALUES.join(', ')}`),
];

const createPetValidator = [nameRule(false), speciesRule(false), priceRule(false), imageRule(false), ...commonOptionalRules];

const updatePetValidator = [nameRule(true), speciesRule(true), priceRule(true), imageRule(true), ...commonOptionalRules];

const listPetsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page phải là số nguyên >= 1'),
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('limit phải là số nguyên từ 1 đến 200'),
  query('species').optional().isIn(SPECIES_VALUES).withMessage(`species phải là một trong: ${SPECIES_VALUES.join(', ')}`),
  query('search').optional().isString().trim(),
  query('sort').optional().isIn(SORT_VALUES).withMessage(`sort phải là một trong: ${SORT_VALUES.join(', ')}`),
];

module.exports = { createPetValidator, updatePetValidator, listPetsValidator };
