const express = require('express');
const {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const {
  createCategoryValidator,
  updateCategoryValidator,
  listCategoriesValidator,
} = require('../validators/category.validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.get('/', listCategoriesValidator, validate, listCategories);
router.get('/:id', getCategoryById);

router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), createCategoryValidator, validate, createCategory);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), updateCategoryValidator, validate, updateCategory);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), deleteCategory);

module.exports = router;
