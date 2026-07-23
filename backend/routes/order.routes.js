const express = require('express');
const {
  listOrders,
  getOrderById,
  checkout,
  cancelOrder,
  updateOrderStatus,
} = require('../controllers/order.controller');
const {
  createOrderValidator,
  orderIdValidator,
  updateStatusValidator,
} = require('../validators/order.validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.get('/', authenticate, listOrders);
router.get('/:id', authenticate, orderIdValidator, validate, getOrderById);
router.post('/', authenticate, createOrderValidator, validate, checkout);

router.put('/:id/cancel', authenticate, orderIdValidator, validate, cancelOrder);

router.put('/:id/status', authenticate, authorize(ROLES.ADMIN), updateStatusValidator, validate, updateOrderStatus);

module.exports = router;
