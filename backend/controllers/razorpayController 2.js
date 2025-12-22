const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const { sendBookingConfirmationEmail } = require('../utils/emailService');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Create Razorpay order for booking payment
 * @route   POST /api/payments/razorpay/create-order
 * @access  Private
 */
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    // Validate booking
    const booking = await Booking.findById(bookingId).populate('user car');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify user owns this booking
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to make payment for this booking',
      });
    }

    // Check if payment already completed
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this booking',
      });
    }

    // Convert amount to paise (Razorpay requires amount in smallest currency unit)
    const amountInPaise = Math.round(booking.totalAmount * 100);

    // Create short receipt (max 40 chars for Razorpay)
    const shortBookingId = bookingId.substring(bookingId.length - 8);
    const timestamp = Date.now().toString().substring(5);
    const receipt = `bk_${shortBookingId}_${timestamp}`;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt,
      notes: {
        bookingId: booking._id.toString(),
        userId: booking.user._id.toString(),
        carName: booking.car.name,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
      },
    });

    // Update booking with Razorpay order ID
    booking.razorpayOrderId = razorpayOrder.id;
    booking.paymentStatus = 'processing';
    booking.paymentAttempts += 1;
    await booking.save();

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingDetails: {
        id: booking._id,
        carName: booking.car.name,
        totalDays: booking.totalDays,
        totalAmount: booking.totalAmount,
      },
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payments/razorpay/verify-payment
 * @access  Private
 */
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details',
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify user owns this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Verify Razorpay order ID matches
    if (booking.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    // Generate signature for verification
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Verify signature
    if (generatedSignature !== razorpay_signature) {
      // Mark payment as failed
      booking.paymentStatus = 'failed';
      booking.paymentError = 'Invalid payment signature';
      await booking.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature',
      });
    }

    // Fetch payment details from Razorpay for additional verification
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      
      // Verify payment status
      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        booking.paymentStatus = 'failed';
        booking.paymentError = `Payment status: ${payment.status}`;
        await booking.save();

        return res.status(400).json({
          success: false,
          message: `Payment not successful. Status: ${payment.status}`,
        });
      }

      // Update booking with payment details
      booking.razorpayPaymentId = razorpay_payment_id;
      booking.razorpaySignature = razorpay_signature;
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.paymentMethod = payment.method === 'upi' ? 'razorpay_upi' : `razorpay_${payment.method}`;
      booking.paymentVerified = true;
      booking.paymentError = null;
      
      await booking.save();

      // Populate user and car details for email
      await booking.populate('user', 'name email phone');
      await booking.populate('car', 'name model brand type images rentPerDay');

      // Send confirmation email asynchronously (non-blocking)
      // Only send if not already sent to prevent duplicates
      if (!booking.confirmationEmailSent) {
        sendBookingConfirmationEmail(booking)
          .then((emailResult) => {
            if (emailResult.success) {
              // Update booking with email sent status
              Booking.findByIdAndUpdate(booking._id, {
                confirmationEmailSent: true,
                confirmationEmailSentAt: new Date(),
                confirmationEmailMessageId: emailResult.messageId,
              }).catch(err => console.error('Error updating email status:', err));
            }
          })
          .catch((error) => {
            console.error('Email sending error:', error);
            // Don't fail the payment verification if email fails
          });
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully! Your booking is confirmed.',
        booking: {
          id: booking._id,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          paymentMethod: booking.paymentMethod,
        },
        paymentDetails: {
          paymentId: payment.id,
          amount: payment.amount / 100, // Convert back to rupees
          method: payment.method,
          status: payment.status,
        },
      });
    } catch (paymentFetchError) {
      console.error('Error fetching payment details:', paymentFetchError);
      
      // Still update booking if signature is valid
      booking.razorpayPaymentId = razorpay_payment_id;
      booking.razorpaySignature = razorpay_signature;
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.paymentVerified = true;
      await booking.save();

      // Populate user and car details for email
      await booking.populate('user', 'name email phone');
      await booking.populate('car', 'name model brand type images rentPerDay');

      // Send confirmation email asynchronously (non-blocking)
      if (!booking.confirmationEmailSent) {
        sendBookingConfirmationEmail(booking)
          .then((emailResult) => {
            if (emailResult.success) {
              Booking.findByIdAndUpdate(booking._id, {
                confirmationEmailSent: true,
                confirmationEmailSentAt: new Date(),
                confirmationEmailMessageId: emailResult.messageId,
              }).catch(err => console.error('Error updating email status:', err));
            }
          })
          .catch((error) => {
            console.error('Email sending error:', error);
          });
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully!',
        booking: {
          id: booking._id,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
        },
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
};

/**
 * @desc    Handle Razorpay webhook events
 * @route   POST /api/payments/razorpay/webhook
 * @access  Public (but verified with webhook secret)
 */
exports.razorpayWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing webhook signature',
      });
    }

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    // Verify signature
    if (expectedSignature !== webhookSignature) {
      console.error('Webhook signature mismatch');
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    console.log(`Razorpay Webhook Event: ${event}`);

    // Handle different webhook events
    switch (event) {
      case 'payment.authorized':
      case 'payment.captured':
        await handlePaymentSuccess(paymentEntity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(paymentEntity);
        break;

      case 'order.paid':
        console.log('Order paid event received');
        break;

      default:
        console.log(`Unhandled event: ${event}`);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
};

/**
 * Helper function to handle successful payment
 */
const handlePaymentSuccess = async (paymentEntity) => {
  try {
    const bookingId = paymentEntity.notes?.bookingId;
    
    if (!bookingId) {
      console.error('No bookingId in payment notes');
      return;
    }

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      console.error(`Booking not found: ${bookingId}`);
      return;
    }

    // Update only if not already paid
    if (booking.paymentStatus !== 'paid') {
      booking.razorpayPaymentId = paymentEntity.id;
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.paymentVerified = true;
      booking.paymentMethod = paymentEntity.method === 'upi' ? 'razorpay_upi' : `razorpay_${paymentEntity.method}`;
      
      await booking.save();
      console.log(`Booking ${bookingId} payment confirmed via webhook`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

/**
 * Helper function to handle failed payment
 */
const handlePaymentFailed = async (paymentEntity) => {
  try {
    const bookingId = paymentEntity.notes?.bookingId;
    
    if (!bookingId) {
      console.error('No bookingId in payment notes');
      return;
    }

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      console.error(`Booking not found: ${bookingId}`);
      return;
    }

    booking.paymentStatus = 'failed';
    booking.paymentError = paymentEntity.error_description || 'Payment failed';
    
    await booking.save();
    console.log(`Booking ${bookingId} payment failed via webhook`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};

/**
 * @desc    Get payment status
 * @route   GET /api/payments/razorpay/status/:bookingId
 * @access  Private
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify user owns this booking
    if (booking.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.status(200).json({
      success: true,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.status,
      razorpayOrderId: booking.razorpayOrderId,
      razorpayPaymentId: booking.razorpayPaymentId,
      paymentMethod: booking.paymentMethod,
      totalAmount: booking.totalAmount,
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
    });
  }
};
