// Legacy payment controller - DEPRECATED
// Razorpay is now the primary payment method
// This file is kept for backward compatibility only

const Booking = require('../models/Booking');

exports.createPaymentIntent = async (req, res, next) => {
  return res.status(410).json({
    success: false,
    message: 'Stripe payment deprecated. Please use Razorpay payment at /api/payments/razorpay/create-order',
  });
};

exports.refundPayment = async (req, res, next) => {
  return res.status(410).json({
    success: false,
    message: 'Stripe payment deprecated. For refunds, contact support.',
  });
};
