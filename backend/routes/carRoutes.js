const express = require('express');
const router = express.Router();
const {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  checkAvailability,
} = require('../controllers/carController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getCars);
router.get('/:id', getCar);
router.post('/:id/check-availability', checkAvailability);

// Protected routes - Admin only
router.post('/', protect, authorize('admin'), upload.array('images', 5), createCar);
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), updateCar);
router.patch('/:id', protect, authorize('admin'), updateCar);
router.delete('/:id', protect, authorize('admin'), deleteCar);

module.exports = router;
