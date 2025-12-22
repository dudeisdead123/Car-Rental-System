const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide car name'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Please provide car model'],
  },
  brand: {
    type: String,
    required: [true, 'Please provide car brand'],
  },
  type: {
    type: String,
    required: [true, 'Please provide car type'],
    enum: ['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Convertible', 'Van', 'Truck'],
  },
  seats: {
    type: Number,
    required: [true, 'Please provide number of seats'],
    min: 2,
    max: 15,
  },
  rentPerDay: {
    type: Number,
    required: [true, 'Please provide rent per day'],
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    default: 'Petrol',
  },
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic'],
    default: 'Manual',
  },
  availability: {
    type: Boolean,
    default: true,
  },
  images: [{
    type: String,
  }],
  description: {
    type: String,
  },
  features: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Car', carSchema);
