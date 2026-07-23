const express = require('express');
const { listWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlist.controller');
const { addWishlistValidator, removeWishlistValidator } = require('../validators/wishlist.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, listWishlist);
router.post('/', authenticate, addWishlistValidator, validate, addToWishlist);
router.delete('/:productId', authenticate, removeWishlistValidator, validate, removeFromWishlist);

module.exports = router;
