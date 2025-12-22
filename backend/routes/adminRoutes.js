const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { sendTestEmail } = require('../utils/emailService');
const {
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');
const {
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

/**
 * @desc    Get all bookings (Admin)
 * @route   GET /api/admin/bookings
 * @access  Private/Admin
 */
router.get('/bookings', protect, authorize('admin'), getAllBookings);

/**
 * @desc    Update booking status (Admin)
 * @route   PATCH /api/admin/bookings/:id
 * @access  Private/Admin
 */
router.patch('/bookings/:id', protect, authorize('admin'), updateBookingStatus);

/**
 * @desc    Delete booking (Admin)
 * @route   DELETE /api/admin/bookings/:id
 * @access  Private/Admin
 */
router.delete('/bookings/:id', protect, authorize('admin'), deleteBooking);

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
router.get('/users', protect, authorize('admin'), getUsers);

/**
 * @desc    Update user (Admin)
 * @route   PATCH /api/admin/users/:id
 * @access  Private/Admin
 */
router.patch('/users/:id', protect, authorize('admin'), updateUser);

/**
 * @desc    Delete user (Admin)
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

/**
 * @desc    Test email configuration
 * @route   POST /api/admin/test-email
 * @access  Private/Admin
 */
router.post('/test-email', protect, authorize('admin'), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    const result = await sendTestEmail(email);

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${email}`,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
      hint: 'Check EMAIL_USER and EMAIL_PASS in .env file',
    });
  }
});

module.exports = router;
