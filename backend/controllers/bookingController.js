const Booking = require('../models/Booking');
const Car = require('../models/Car');


exports.createBooking = async (req, res, next) => {
  try {
    const { car, startDate, endDate, pickupLocation, dropoffLocation } = req.body;

    const carData = await Car.findById(car);
    if (!carData) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    // Get owner details
    const User = require('../models/User');
    const owner = await User.findOne({ isOwner: true });
    
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner details not found',
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past',
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date',
      });
    }

    // Check availability - only block dates with confirmed PAID bookings
    const overlappingBookings = await Booking.find({
      car: car,
      paymentStatus: 'paid', // Only paid bookings block availability
      status: { $nin: ['cancelled'] }, // Exclude cancelled bookings
      $or: [
        { 
          startDate: { $lte: end }, 
          endDate: { $gte: start } 
        },
      ],
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Car is not available for selected dates',
      });
    }

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * carData.rentPerDay;

    // Set payment deadline to 15 minutes from now
    const paymentDeadline = new Date(Date.now() + 15 * 60 * 1000);

    // Create booking with pending payment status
    const booking = await Booking.create({
      user: req.user.id,
      car,
      startDate,
      endDate,
      totalDays,
      totalAmount,
      pickupLocation,
      dropoffLocation,
      status: 'pending', // Booking is pending until payment is complete
      paymentStatus: 'pending',
      paymentDeadline,
      ownerPhone: owner.phone,
      ownerUpiId: owner.upiId,
    });

    await booking.populate('car', 'name model brand type images rentPerDay');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully! Please pay to owner.',
      booking,
      paymentDeadline: booking.paymentDeadline,
      owner: {
        name: owner.name,
        phone: owner.phone,
        upiId: owner.upiId,
        upiQrCode: owner.upiQrCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate('car', 'name model brand type images rentPerDay')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};


exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('car', 'name model brand type images rentPerDay')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};


exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('car', 'name model brand type images rentPerDay');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email phone')
      .populate('car', 'name model brand type images rentPerDay');

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    const now = new Date();
    const hoursUntilStart = (new Date(booking.startDate) - now) / (1000 * 60 * 60);

    if (hoursUntilStart < 24 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Booking can only be cancelled at least 24 hours before start date',
      });
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    )
      .populate('user', 'name email phone')
      .populate('car', 'name model brand type images rentPerDay');

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Verify payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify this booking',
      });
    }

    // Check if payment deadline has passed
    if (new Date() > booking.paymentDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Payment deadline has passed. Please create a new booking.',
        expired: true,
      });
    }

    // Check if payment has been verified by owner
    if (booking.paymentVerified) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();

      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Payment verified! Your booking is confirmed.',
        booking,
      });
    } else {
      return res.status(200).json({
        success: true,
        verified: false,
        message: 'Payment verification pending. Please wait for owner to confirm your payment.',
        booking,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Confirm payment (for owner/admin)
exports.confirmPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Only owner/admin can confirm
    if (!req.user.isOwner && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm payments',
      });
    }

    booking.paymentVerified = true;
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      booking,
    });
  } catch (error) {
    next(error);
  }
};


exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
