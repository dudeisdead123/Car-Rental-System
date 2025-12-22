const express = require('express');
const router = express.Router();
const { register, login, getMe, requestOTP, verifyOTPLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTPLogin);
router.get('/me', protect, getMe);

module.exports = router;
