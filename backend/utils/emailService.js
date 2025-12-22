const nodemailer = require('nodemailer');

/**
 * Create email transporter using environment variables
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });
};

/**
 * Send booking confirmation email after successful payment
 * @param {Object} booking - Booking object with user and car populated
 */
const sendBookingConfirmationEmail = async (booking) => {
  try {
    // Check if email service is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️  Email service not configured. Skipping email notification.');
      return { success: false, message: 'Email service not configured' };
    }

    // Validate booking has required data
    if (!booking || !booking.user || !booking.car) {
      console.error('❌ Invalid booking data for email');
      return { success: false, message: 'Invalid booking data' };
    }

    const transporter = createTransporter();

    // Format dates
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // Email subject
    const subject = `Car Booking Confirmed – Booking ID #${booking._id.toString().substring(0, 8).toUpperCase()}`;

    // HTML email template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #000 0%, #434343 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .header .icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .content {
          padding: 30px 20px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #000;
        }
        .confirmation-badge {
          display: inline-block;
          background: #28a745;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .booking-details {
          background: #f8f9fa;
          border-left: 4px solid #000;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: bold;
          color: #555;
        }
        .detail-value {
          color: #000;
          text-align: right;
        }
        .amount-highlight {
          background: #000;
          color: white;
          padding: 15px;
          border-radius: 4px;
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .cta-button {
          display: inline-block;
          background: #000;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <div class="icon">🚗</div>
          <h1>Booking Confirmed!</h1>
        </div>
        
        <!-- Content -->
        <div class="content">
          <div class="greeting">
            Dear ${booking.user.name},
          </div>
          
          <span class="confirmation-badge">✓ CONFIRMED</span>
          
          <p>Great news! Your car rental booking has been successfully confirmed. Your payment has been received and processed.</p>
          
          <!-- Booking Details -->
          <div class="booking-details">
            <h3 style="margin-top: 0; color: #000;">📋 Booking Details</h3>
            
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">#${booking._id.toString().substring(0, 8).toUpperCase()}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Car:</span>
              <span class="detail-value">${booking.car.name} (${booking.car.model})</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Category:</span>
              <span class="detail-value">${booking.car.type || 'Standard'}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Pickup Location:</span>
              <span class="detail-value">${booking.pickupLocation}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Drop Location:</span>
              <span class="detail-value">${booking.dropoffLocation}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Rental Start Date:</span>
              <span class="detail-value">${formatDate(booking.startDate)}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Rental End Date:</span>
              <span class="detail-value">${formatDate(booking.endDate)}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">${booking.totalDays} days</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">Razorpay</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Booking Status:</span>
              <span class="detail-value" style="color: #28a745; font-weight: bold;">Confirmed</span>
            </div>
          </div>
          
          <!-- Amount -->
          <div class="amount-highlight">
            Total Amount Paid: ₹${booking.totalAmount.toLocaleString('en-IN')}
          </div>
          
          <p style="margin-top: 30px;">
            <strong>What's Next?</strong><br>
            Please arrive at the pickup location on time with the following documents:
          </p>
          <ul style="color: #555;">
            <li>Valid driving license</li>
            <li>Government-issued ID proof</li>
            <li>This booking confirmation (printed or digital)</li>
          </ul>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you have any questions or need to make changes to your booking, please contact our support team.
          </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p style="margin: 0; font-weight: bold;">Car Rental System</p>
          <p style="margin: 5px 0;">Thank you for choosing our service!</p>
          <p style="margin: 5px 0; font-size: 12px; color: #999;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Plain text fallback
    const textContent = `
Dear ${booking.user.name},

Your car rental booking has been confirmed!

Booking Details:
- Booking ID: #${booking._id.toString().substring(0, 8).toUpperCase()}
- Car: ${booking.car.name} (${booking.car.model})
- Category: ${booking.car.type || 'Standard'}
- Pickup Location: ${booking.pickupLocation}
- Drop Location: ${booking.dropoffLocation}
- Rental Start: ${formatDate(booking.startDate)}
- Rental End: ${formatDate(booking.endDate)}
- Duration: ${booking.totalDays} days
- Total Amount Paid: ₹${booking.totalAmount.toLocaleString('en-IN')}
- Payment Method: Razorpay
- Status: Confirmed

Please bring your valid driving license and ID proof at the time of pickup.

Thank you for choosing our service!

Car Rental System
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"Car Rental System" <${process.env.EMAIL_USER}>`,
      to: booking.user.email,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Confirmation email sent:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      recipient: booking.user.email,
    };
  } catch (error) {
    // Log error but don't throw - email failure shouldn't break booking
    console.error('❌ Email sending failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send test email to verify email configuration
 */
const sendTestEmail = async (toEmail) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email service not configured');
    }

    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"Car Rental System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Test Email - Car Rental System',
      text: 'This is a test email from Car Rental System.',
      html: '<p>This is a <strong>test email</strong> from Car Rental System.</p>',
    });

    console.log('✅ Test email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    throw error;
  }
};

module.exports = {
  sendBookingConfirmationEmail,
  sendTestEmail,
};
