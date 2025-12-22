const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
  verifyPayment,
  confirmPayment,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/all', protect, authorize('admin'), getAllBookings);
router.get('/:id', protect, getBooking);
router.post('/:id/verify-payment', protect, verifyPayment);
router.put('/:id/confirm-payment', protect, confirmPayment);
router.put('/:id/status', protect, authorize('admin'), updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);
router.delete('/:id', protect, authorize('admin'), deleteBooking);

module.exports = router;
