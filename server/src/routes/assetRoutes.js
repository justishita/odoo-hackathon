const express = require('express');
const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} = require('../controllers/assetController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET routes (accessible by employee, department_head, asset_manager, admin)
router.get('/', getAssets);
router.get('/:id', getAssetById);

// Write routes (restricted to admin and asset_manager roles)
router.post('/', authorize('admin', 'asset_manager'), createAsset);
router.put('/:id', authorize('admin', 'asset_manager'), updateAsset);
router.delete('/:id', authorize('admin', 'asset_manager'), deleteAsset);

module.exports = router;
