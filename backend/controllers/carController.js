const Car = require('../models/Car');
const Booking = require('../models/Booking');

exports.getCars = async (req, res, next) => {
  try {
    const { type, brand, minPrice, maxPrice, seats, search } = req.query;
    let query = {};

    if (type) query.type = type;
    if (brand) query.brand = brand;
    if (seats) query.seats = parseInt(seats);
    if (minPrice || maxPrice) {
      query.rentPerDay = {};
      if (minPrice) query.rentPerDay.$gte = parseInt(minPrice);
      if (maxPrice) query.rentPerDay.$lte = parseInt(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    const cars = await Car.find(query).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    res.status(200).json({
      success: true,
      car,
    });
  } catch (error) {
    next(error);
  }
};

exports.createCar = async (req, res, next) => {
  try {
    // Handle image uploads
    if (req.files) {
      req.body.images = req.files.map(file => `/uploads/cars/${file.filename}`);
    }

    const car = await Car.create(req.body);

    res.status(201).json({
      success: true,
      car,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private/Admin
exports.updateCar = async (req, res, next) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/cars/${file.filename}`);
      // If replaceImages is true, replace all images, otherwise add to existing
      if (req.body.replaceImages === 'true') {
        req.body.images = newImages;
      } else {
        req.body.images = [...(car.images || []), ...newImages];
      }
    }

    car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      car,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private/Admin
exports.deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    await car.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.checkAvailability = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const carId = req.params.id;

    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    // Check if car is marked as unavailable
    if (!car.availability) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'Car is currently unavailable',
      });
    }

    // Check for overlapping bookings - only paid bookings block availability
    const overlappingBookings = await Booking.find({
      car: carId,
      paymentStatus: 'paid', // Only paid bookings block availability
      status: { $nin: ['cancelled'] }, // Exclude cancelled bookings
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
      ],
    });

    const available = overlappingBookings.length === 0;

    res.status(200).json({
      success: true,
      available,
      message: available ? 'Car is available' : 'Car is already booked for selected dates',
    });
  } catch (error) {
    next(error);
  }
};
