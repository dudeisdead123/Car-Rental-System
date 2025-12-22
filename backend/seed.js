const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Car = require('./models/Car');

// Load env vars
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleCars = [
  {
    name: 'Toyota Camry 2023',
    model: 'Camry',
    brand: 'Toyota',
    type: 'Sedan',
    seats: 5,
    rentPerDay: 50,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    availability: true,
    description: 'Comfortable and reliable sedan perfect for city driving and long trips.',
    features: ['GPS', 'Air Conditioning', 'Bluetooth', 'Backup Camera', 'Cruise Control'],
  },
  {
    name: 'Honda CR-V 2023',
    model: 'CR-V',
    brand: 'Honda',
    type: 'SUV',
    seats: 7,
    rentPerDay: 75,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    availability: true,
    description: 'Spacious SUV with plenty of room for family adventures.',
    features: ['GPS', 'Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Sunroof'],
  },
  {
    name: 'Tesla Model 3',
    model: 'Model 3',
    brand: 'Tesla',
    type: 'Sedan',
    seats: 5,
    rentPerDay: 120,
    fuelType: 'Electric',
    transmission: 'Automatic',
    availability: true,
    description: 'Premium electric sedan with autopilot and cutting-edge technology.',
    features: ['Autopilot', 'Premium Audio', 'GPS', 'Air Conditioning', 'Supercharger Access'],
  },
  {
    name: 'Ford Mustang 2023',
    model: 'Mustang',
    brand: 'Ford',
    type: 'Coupe',
    seats: 4,
    rentPerDay: 100,
    fuelType: 'Petrol',
    transmission: 'Manual',
    availability: true,
    description: 'Iconic sports car with powerful performance and classic styling.',
    features: ['Sport Mode', 'Premium Sound', 'Bluetooth', 'Parking Sensors'],
  },
  {
    name: 'Hyundai i20',
    model: 'i20',
    brand: 'Hyundai',
    type: 'Hatchback',
    seats: 5,
    rentPerDay: 35,
    fuelType: 'Petrol',
    transmission: 'Manual',
    availability: true,
    description: 'Compact and fuel-efficient hatchback ideal for city commuting.',
    features: ['Air Conditioning', 'Bluetooth', 'USB Charging', 'Power Windows'],
  },
  {
    name: 'Mercedes-Benz E-Class',
    model: 'E-Class',
    brand: 'Mercedes-Benz',
    type: 'Sedan',
    seats: 5,
    rentPerDay: 150,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    availability: true,
    description: 'Luxury sedan with premium features and exceptional comfort.',
    features: ['Leather Seats', 'Sunroof', 'Premium Audio', 'GPS', 'Heated Seats', 'Massage Seats'],
  },
  {
    name: 'Jeep Wrangler',
    model: 'Wrangler',
    brand: 'Jeep',
    type: 'SUV',
    seats: 5,
    rentPerDay: 90,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    availability: true,
    description: 'Rugged off-road SUV perfect for adventure seekers.',
    features: ['4WD', 'Removable Top', 'GPS', 'Air Conditioning', 'Bluetooth'],
  },
  {
    name: 'BMW X5',
    model: 'X5',
    brand: 'BMW',
    type: 'SUV',
    seats: 7,
    rentPerDay: 130,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    availability: true,
    description: 'Luxury hybrid SUV combining performance with efficiency.',
    features: ['Panoramic Sunroof', 'Leather Seats', 'GPS', 'Adaptive Cruise Control', 'Parking Assist'],
  },
];

const seedDatabase = async () => {
  try {
    // Delete existing data
    await User.deleteMany();
    await Car.deleteMany();
    console.log('Existing data deleted');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@carrental.com',
      password: 'admin123',
      phone: '+1234567890',
      role: 'admin',
    });
    console.log('Admin user created:', admin.email);

    // Create regular user
    const user = await User.create({
      name: 'John Doe',
      email: 'user@carrental.com',
      password: 'user123',
      phone: '+1234567891',
      role: 'user',
    });
    console.log('Regular user created:', user.email);

    // Create cars
    const cars = await Car.insertMany(sampleCars);
    console.log(`${cars.length} cars created`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: admin@carrental.com');
    console.log('  Password: admin123');
    console.log('\nUser:');
    console.log('  Email: user@carrental.com');
    console.log('  Password: user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
