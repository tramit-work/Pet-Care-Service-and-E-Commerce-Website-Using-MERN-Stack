const express = require('express');
const {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const {
  createProductValidator,
  updateProductValidator,
  listProductsValidator,
} = require('../validators/product.validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.get('/', listProductsValidator, validate, listProducts);
router.get('/:id', getProductById);

router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), createProductValidator, validate, createProduct);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), updateProductValidator, validate, updateProduct);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), deleteProduct);

module.exports = router;
