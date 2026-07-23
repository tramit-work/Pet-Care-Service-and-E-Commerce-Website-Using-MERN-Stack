const express = require('express');
const {
  listPublicReviews,
  listAdminReviews,
  getReviewById,
  createReview,
  updateReview,
  updateReviewStatus,
} = require('../controllers/review.controller');
const {
  listPublicReviewsValidator,
  createReviewValidator,
  updateReviewValidator,
  updateReviewStatusValidator,
  reviewIdValidator,
} = require('../validators/review.validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.get('/', listPublicReviewsValidator, validate, listPublicReviews);
router.get('/admin', authenticate, authorize(ROLES.ADMIN), listAdminReviews);
router.get('/:id', authenticate, reviewIdValidator, validate, getReviewById);

router.post('/', authenticate, createReviewValidator, validate, createReview);
router.put('/:id', authenticate, updateReviewValidator, validate, updateReview);
router.put('/:id/status', authenticate, authorize(ROLES.ADMIN), updateReviewStatusValidator, validate, updateReviewStatus);

module.exports = router;
