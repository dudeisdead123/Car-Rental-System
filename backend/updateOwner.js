const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

// UPDATE THESE WITH YOUR REAL DETAILS
const OWNER_DETAILS = {
  name: 'Anshuman',              // Your actual name
  phone: '9876543210',                 // Your phone number
  upiId: 'ansumanaheeer8@oksbi',      // Your UPI ID
  upiQrCode: '/uploads/upi-qr.png',
 }   // Path to QR code
const updateOwnerDetails = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');

    // Find and update owner
    const owner = await User.findOneAndUpdate(
      { isOwner: true },
      {
        $set: {
          name: OWNER_DETAILS.name,
          phone: OWNER_DETAILS.phone,
          upiId: OWNER_DETAILS.upiId,
          upiQrCode: OWNER_DETAILS.upiQrCode,
        }
      },
      { new: true }
    );

    if (!owner) {
      console.log('❌ No owner found. Run createOwner.js first.');
      process.exit(1);
    }

    console.log('\n✅ Owner details updated successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Name:', owner.name);
    console.log('Email:', owner.email);
    console.log('Phone:', owner.phone);
    console.log('UPI ID:', owner.upiId);
    console.log('UPI QR Code:', owner.upiQrCode);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Customers will now see your QR code when booking!');
    console.log('\n📝 To upload your QR code:');
    console.log('   1. Save your UPI QR code image as: uploads/upi-qr.png');
    console.log('   2. Or update the path in updateOwner.js');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateOwnerDetails();
