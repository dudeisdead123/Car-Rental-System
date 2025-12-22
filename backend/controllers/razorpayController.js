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
 * @route   POST /api/razorpay/create-order
 * @access  Private
 */
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { car, startDate, endDate, pickupLocation, dropoffLocation } = req.body;

    // Validate input
    if (!car || !startDate || !endDate || !pickupLocation || !dropoffLocation) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking details',
      });
    }

    // Calculate total days and amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date',
      });
    }

    // Get car details
    const Car = require('../models/Car');
    const carDetails = await Car.findById(car);
    
    if (!carDetails) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    if (!carDetails.availability) {
      return res.status(400).json({
        success: false,
        message: 'Car is not available',
      });
    }

    const totalAmount = totalDays * carDetails.rentPerDay;

    // Create booking first
    const booking = await Booking.create({
      user: req.user.id,
      car: car,
      startDate,
      endDate,
      totalDays,
      totalAmount,
      pickupLocation,
      dropoffLocation,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Convert amount to paise (Razorpay requires amount in smallest currency unit)
    const amountInPaise = Math.round(totalAmount * 100);

    // Create short receipt (max 40 chars for Razorpay)
    const shortBookingId = booking._id.toString().substring(booking._id.toString().length - 8);
    const timestamp = Date.now().toString().substring(5);
    const receipt = `bk_${shortBookingId}_${timestamp}`;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt,
      notes: {
        bookingId: booking._id.toString(),
        userId: req.user.id,
        carName: carDetails.name,
        startDate: startDate,
        endDate: endDate,
      },
    });

    // Update booking with Razorpay order ID
    booking.razorpayOrderId = razorpayOrder.id;
    booking.paymentStatus = 'processing';
    await booking.save();

    res.status(200).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      booking: {
        _id: booking._id,
        carName: carDetails.name,
        totalDays,
        totalAmount,
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
 * @route   POST /api/razorpay/verify-payment
 * @access  Private
 */
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingId,
    } = req.body;

    console.log('Verify payment request:', { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId });

    // Validate required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details',
      });
    }

    // Find booking and populate user and car
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
        message: 'Not authorized',
      });
    }

    // Verify Razorpay order ID matches
    if (booking.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    // Generate signature for verification
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    console.log('Signature verification:', {
      generated: generatedSignature,
      received: razorpaySignature,
      match: generatedSignature === razorpaySignature
    });

    // Verify signature
    if (generatedSignature !== razorpaySignature) {
      // Mark payment as failed
      booking.paymentStatus = 'failed';
      booking.paymentError = 'Invalid payment signature';
      await booking.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature',
      });
    }

    // Update booking with payment details
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpaySignature = razorpaySignature;
    booking.paymentStatus = 'paid';
    booking.paymentVerified = true;
    booking.status = 'confirmed';
    booking.paidAt = Date.now();
    await booking.save();

    // Send confirmation email asynchronously (don't block response)
    if (!booking.confirmationEmailSent) {
      sendBookingConfirmationEmail(booking)
        .then((emailResult) => {
          if (emailResult.success) {
            booking.confirmationEmailSent = true;
            booking.confirmationEmailSentAt = Date.now();
            booking.confirmationEmailMessageId = emailResult.messageId;
            booking.save().catch(err => console.error('Error updating email status:', err));
            console.log('✅ Confirmation email sent successfully');
          }
        })
        .catch((err) => {
          console.error('❌ Failed to send confirmation email:', err);
        });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      booking: booking,
    });
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
 * @desc    Get payment status for a booking
 * @route   GET /api/razorpay/status/:bookingId
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
    if (booking.user.toString() !== req.user.id) {
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
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message,
    });
  }
};

/**
 * @desc    Handle Razorpay webhook events
 * @route   POST /api/razorpay/webhook
 * @access  Public (verified by signature)
 */
exports.razorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.log('Webhook secret not configured');
      return res.status(200).json({ received: true });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      console.log('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`Razorpay webhook event: ${event}`);

    // Handle different event types
    if (event === 'payment.captured') {
      const orderId = payload.payment.entity.order_id;
      const paymentId = payload.payment.entity.id;

      const booking = await Booking.findOne({ razorpayOrderId: orderId });
      
      if (booking && booking.paymentStatus !== 'paid') {
        booking.razorpayPaymentId = paymentId;
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        booking.paymentVerified = true;
        await booking.save();
        console.log(`Payment captured for booking: ${booking._id}`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
