const nodemailer = require('nodemailer');

/**
 * Generate a 6-digit OTP
 */
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Email from admin to user
 */
exports.sendOTP = async (email, otp) => {
  const adminEmail = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASS;

  console.log('🔍 DEBUG: Admin Email:', adminEmail);
  console.log('🔍 DEBUG: Sending OTP to:', email);

  // Check if email is configured
  if (!adminEmail || !emailPassword) {
    console.log('='.repeat(60));
    console.log('📧 OTP EMAIL - DEVELOPMENT MODE');
    console.log('='.repeat(60));
    console.log(`From (Admin): ${adminEmail || 'Not configured'}`);
    console.log(`To (User): ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Valid for: 5 minutes`);
    console.log('='.repeat(60));

    return {
      success: true,
      message: `OTP: ${otp} (Email not configured - check console)`,
    };
  }

  // Production mode: Send real email via Gmail SMTP
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: adminEmail,
        pass: emailPassword,
      },
    });

    const mailOptions = {
      from: `"Car Rental System" <${adminEmail}>`,
      to: email,
      subject: 'Your Login OTP - Car Rental System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .otp-box { background: #fff; border: 2px dashed #000; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { color: #d32f2f; font-weight: bold; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 Car Rental System</h1>
            </div>
            <div class="content">
              <h2>Your Login OTP</h2>
              <p>Hello,</p>
              <p>You requested to login to your Car Rental account. Please use the following One-Time Password (OTP) to complete your login:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <p><strong>This OTP is valid for 5 minutes.</strong></p>
              
              <p>If you didn't request this OTP, please ignore this email or contact our support team immediately.</p>
              
              <p class="warning">⚠️ Never share this OTP with anyone!</p>
              
              <div class="footer">
                <p>This is an automated email from Car Rental System</p>
                <p>Admin Email: ${adminEmail}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log('='.repeat(60));
    console.log('✅ OTP EMAIL SENT SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`From (Admin): ${adminEmail}`);
    console.log(`To (User): ${email}`);
    console.log(`OTP: ${otp}`);
    console.log('='.repeat(60));

    return {
      success: true,
      message: 'OTP sent successfully to your email',
    };
  } catch (error) {
    console.error('❌ Email Error:', error.message);
    
    console.log('='.repeat(60));
    console.log('⚠️  EMAIL FAILED - SHOWING OTP');
    console.log('='.repeat(60));
    console.log(`Email: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log(`Error: ${error.message}`);
    console.log('='.repeat(60));

    return {
      success: true,
      message: `OTP: ${otp} (Email failed - check console)`,
    };
  }
};

/**
 * Verify OTP
 */
exports.verifyOTP = (storedOTP, providedOTP, otpExpiry) => {
  if (!storedOTP || !otpExpiry) {
    return {
      success: false,
      message: 'No OTP found. Please request a new OTP.',
    };
  }

  if (new Date() > otpExpiry) {
    return {
      success: false,
      message: 'OTP has expired. Please request a new OTP.',
    };
  }

  if (storedOTP !== providedOTP) {
    return {
      success: false,
      message: 'Invalid OTP. Please try again.',
    };
  }

  return {
    success: true,
    message: 'OTP verified successfully',
  };
};
