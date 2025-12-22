const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
  getPaymentStatus,
} = require('../controllers/razorpayController');
const { protect } = require('../middleware/auth');

// Protected routes (require authentication)
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyRazorpayPayment);
router.get('/status/:bookingId', protect, getPaymentStatus);

// Webhook route (no auth - verified by signature)
router.post('/webhook', razorpayWebhook);

module.exports = router;
