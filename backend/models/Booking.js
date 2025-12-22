const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date'],
  },
  totalDays: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'payment_pending', 'confirmed', 'cancelled', 'completed'],
    default: 'payment_pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  // Razorpay Payment Details
  razorpayOrderId: {
    type: String,
    index: true,
  },
  razorpayPaymentId: {
    type: String,
    index: true,
  },
  razorpaySignature: {
    type: String,
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay_upi', 'razorpay_card', 'razorpay_netbanking', 'manual_upi', 'cash'],
    default: 'razorpay_upi',
  },
  paymentAttempts: {
    type: Number,
    default: 0,
  },
  paymentError: {
    type: String,
  },
  // Legacy fields
  paymentIntentId: {
    type: String,
  },
  ownerPhone: {
    type: String,
  },
  ownerUpiId: {
    type: String,
  },
  paymentDeadline: {
    type: Date,
  },
  paymentVerified: {
    type: Boolean,
    default: false,
  },
  // Email notification tracking
  confirmationEmailSent: {
    type: Boolean,
    default: false,
  },
  confirmationEmailSentAt: {
    type: Date,
  },
  confirmationEmailMessageId: {
    type: String,
  },
  pickupLocation: {
    type: String,
    required: [true, 'Please provide pickup location'],
  },
  dropoffLocation: {
    type: String,
    required: [true, 'Please provide dropoff location'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Validate end date is after start date
bookingSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
