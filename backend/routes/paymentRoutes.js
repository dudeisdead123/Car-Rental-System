const express = require('express');
const {
  createPaymentIntent,
  refundPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Legacy routes (deprecated - return 410 Gone)
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/refund', protect, authorize('admin'), refundPayment);

module.exports = router;
