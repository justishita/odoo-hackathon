const express = require('express');
const {
  getMaintenanceTickets,
  createMaintenanceTicket,
  updateMaintenanceTicket,
} = require('../controllers/maintenanceController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET tickets list (accessible to all logged-in roles)
router.get('/', getMaintenanceTickets);

// POST create request (restricted to admin and asset_manager)
router.post('/', authorize('admin', 'asset_manager'), createMaintenanceTicket);

// PUT update details or resolve ticket (restricted to admin and asset_manager)
router.put('/:id', authorize('admin', 'asset_manager'), updateMaintenanceTicket);

module.exports = router;
