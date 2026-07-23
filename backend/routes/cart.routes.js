const express = require('express');
const { getCart, addItem, updateItemQuantity, removeItem, clearCart } = require('../controllers/cart.controller');
const { addItemValidator, updateItemValidator, removeItemValidator } = require('../validators/cart.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, getCart);
router.post('/items', authenticate, addItemValidator, validate, addItem);
router.put('/items/:productId', authenticate, updateItemValidator, validate, updateItemQuantity);
router.delete('/items/:productId', authenticate, removeItemValidator, validate, removeItem);
router.delete('/', authenticate, clearCart);

module.exports = router;
