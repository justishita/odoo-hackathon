const express = require('express');
const {
  getUsers,
  updateUser,
  updateUserRole,
  updateUserStatus,
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// All user directory routes require authentication
router.use(auth);

// GET getUsers is accessible by Admin and Asset Manager roles
router.get('/', authorize('admin', 'asset_manager'), getUsers);

// Write routes are admin-only
router.put('/:id', authorize('admin'), updateUser);
router.put('/:id/role', authorize('admin'), updateUserRole);
router.put('/:id/status', authorize('admin'), updateUserStatus);

module.exports = router;
