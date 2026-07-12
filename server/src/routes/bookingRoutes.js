const express = require('express');
const {
  getBookings,
  createBooking,
  updateBookingStatus,
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET bookings list (accessible to all logged-in roles)
router.get('/', getBookings);

// POST create request (accessible to all logged-in roles)
router.post('/', createBooking);

// PATCH approve/decline booking (restricted to admin, asset_manager, department_head)
router.patch('/:id/status', authorize('admin', 'asset_manager', 'department_head'), updateBookingStatus);

module.exports = router;
