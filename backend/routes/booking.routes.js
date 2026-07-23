const express = require('express');
const {
  listBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/booking.controller');
const {
  createBookingValidator,
  updateBookingValidator,
  listBookingsValidator,
} = require('../validators/booking.validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.get('/', authenticate, listBookingsValidator, validate, listBookings);
router.get('/:id', authenticate, getBookingById);
router.post('/', authenticate, createBookingValidator, validate, createBooking);

router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), updateBookingValidator, validate, updateBooking);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), deleteBooking);

module.exports = router;
