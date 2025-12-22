const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createDefaultOwner = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');

    // Check if owner already exists
    const ownerExists = await User.findOne({ isOwner: true });
    
    if (ownerExists) {
      console.log('Default owner already exists:', ownerExists.email);
      console.log('Owner Phone:', ownerExists.phone);
      console.log('Owner UPI ID:', ownerExists.upiId || 'Not set');
      process.exit(0);
    }

    // Create default owner
    const owner = await User.create({
      name: 'Car Rental Owner',
      email: 'owner@carrental.com',
      password: 'owner123',
      phone: '9876543210',
      upiId: 'owner@upi',
      role: 'admin',
      isOwner: true,
    });

    console.log('✅ Default owner created successfully!');
    console.log('Email:', owner.email);
    console.log('Password: owner123');
    console.log('Phone:', owner.phone);
    console.log('UPI ID:', owner.upiId);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createDefaultOwner();
