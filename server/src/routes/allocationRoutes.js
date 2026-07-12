const express = require('express');
const {
  getAllocations,
  createAllocation,
  returnAllocation,
} = require('../controllers/allocationController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET routes (accessible by employee, department_head, asset_manager, admin)
router.get('/', getAllocations);

// Write routes (restricted to admin and asset_manager roles)
router.post('/', authorize('admin', 'asset_manager'), createAllocation);
router.put('/:id/return', authorize('admin', 'asset_manager'), returnAllocation);

module.exports = router;
