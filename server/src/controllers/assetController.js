const Asset = require('../models/Asset');
const AssetCategory = require('../models/AssetCategory');
const Department = require('../models/Department');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all assets with filters, search and pagination
// @route   GET /api/assets
// @access  Private
const getAssets = asyncHandler(async (req, res, next) => {
  const { category, status, condition, department, q, page = 1, limit = 50 } = req.query;

  const query = {};

  // Apply filters
  if (category) {
    query.category = category;
  }
  if (status) {
    query.status = status;
  }
  if (condition) {
    query.condition = condition;
  }
  if (department) {
    query.department = department === 'none' || department === '—' ? null : department;
  }

  // Full-text regex search on name and serialNumber
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { serialNumber: { $regex: q, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const assets = await Asset.find(query)
    .populate('category', 'name customFields')
    .populate('department', 'name')
    .populate('allocatedTo', 'name email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Asset.countDocuments(query);

  return new ApiResponse(
    200,
    {
      assets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    },
    'Assets fetched successfully'
  ).send(res);
});

// @desc    Get single asset details
// @route   GET /api/assets/:id
// @access  Private
const getAssetById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const asset = await Asset.findById(id)
    .populate('category', 'name customFields')
    .populate('department', 'name')
    .populate('allocatedTo', 'name email');

  if (!asset) {
    return next(new ApiError(404, 'Asset not found'));
  }

  return new ApiResponse(200, asset, 'Asset details fetched successfully').send(res);
});

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private/Admin,AssetManager
const createAsset = asyncHandler(async (req, res, next) => {
  const {
    name,
    serialNumber,
    category,
    status,
    condition,
    value,
    purchaseDate,
    department,
    allocatedTo,
    customFieldValues,
  } = req.body;

  // Basic validations
  if (!name || !name.trim()) {
    return next(new ApiError(400, 'Asset name is required'));
  }
  if (!serialNumber || !serialNumber.trim()) {
    return next(new ApiError(400, 'Serial number / hardware ID is required'));
  }
  if (!category) {
    return next(new ApiError(400, 'Category is required'));
  }

  // Ensure serialNumber is unique
  const exists = await Asset.findOne({ serialNumber: serialNumber.trim() });
  if (exists) {
    return next(new ApiError(400, `Asset with Serial Number '${serialNumber}' already exists`));
  }

  // Ensure category exists
  const cat = await AssetCategory.findById(category);
  if (!cat) {
    return next(new ApiError(404, 'Asset category not found'));
  }

  // Validate department if provided
  if (department) {
    const dept = await Department.findById(department);
    if (!dept) {
      return next(new ApiError(404, 'Department not found'));
    }
  }

  // Validate allocatedTo user if provided
  if (allocatedTo) {
    const user = await User.findById(allocatedTo);
    if (!user) {
      return next(new ApiError(404, 'Allocated user not found'));
    }
  }

  const asset = await Asset.create({
    name: name.trim(),
    serialNumber: serialNumber.trim(),
    category,
    status: status || 'Available',
    condition: condition || 'Good',
    value: value !== undefined ? Number(value) : 0,
    purchaseDate: purchaseDate || null,
    department: department || null,
    allocatedTo: allocatedTo || null,
    customFieldValues: customFieldValues || {},
  });

  const populatedAsset = await Asset.findById(asset._id)
    .populate('category', 'name customFields')
    .populate('department', 'name')
    .populate('allocatedTo', 'name email');

  return new ApiResponse(201, populatedAsset, 'Asset registered successfully').send(res);
});

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private/Admin,AssetManager
const updateAsset = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    serialNumber,
    category,
    status,
    condition,
    value,
    purchaseDate,
    department,
    allocatedTo,
    customFieldValues,
  } = req.body;

  const asset = await Asset.findById(id);
  if (!asset) {
    return next(new ApiError(404, 'Asset not found'));
  }

  // Validate serial number uniqueness if changing
  if (serialNumber && serialNumber.trim() !== asset.serialNumber) {
    const exists = await Asset.findOne({ serialNumber: serialNumber.trim() });
    if (exists) {
      return next(new ApiError(400, `Asset with Serial Number '${serialNumber}' already exists`));
    }
    asset.serialNumber = serialNumber.trim();
  }

  if (name !== undefined) {
    asset.name = name.trim();
  }

  if (category !== undefined) {
    const cat = await AssetCategory.findById(category);
    if (!cat) {
      return next(new ApiError(404, 'Asset category not found'));
    }
    asset.category = category;
  }

  if (status !== undefined) {
    asset.status = status;
  }

  if (condition !== undefined) {
    asset.condition = condition;
  }

  if (value !== undefined) {
    asset.value = Number(value) || 0;
  }

  if (purchaseDate !== undefined) {
    asset.purchaseDate = purchaseDate || null;
  }

  // Department assignment validation
  if (department !== undefined) {
    if (department === null || department === '' || department === 'none') {
      asset.department = null;
    } else {
      const dept = await Department.findById(department);
      if (!dept) {
        return next(new ApiError(404, 'Department not found'));
      }
      asset.department = department;
    }
  }

  // Allocated user validation
  if (allocatedTo !== undefined) {
    if (allocatedTo === null || allocatedTo === '' || allocatedTo === 'none') {
      asset.allocatedTo = null;
    } else {
      const user = await User.findById(allocatedTo);
      if (!user) {
        return next(new ApiError(404, 'Allocated user not found'));
      }
      asset.allocatedTo = allocatedTo;
    }
  }

  if (customFieldValues !== undefined) {
    asset.customFieldValues = customFieldValues;
  }

  await asset.save();

  const populatedAsset = await Asset.findById(asset._id)
    .populate('category', 'name customFields')
    .populate('department', 'name')
    .populate('allocatedTo', 'name email');

  return new ApiResponse(200, populatedAsset, 'Asset updated successfully').send(res);
});

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private/Admin,AssetManager
const deleteAsset = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const asset = await Asset.findById(id);
  if (!asset) {
    return next(new ApiError(404, 'Asset not found'));
  }

  await asset.deleteOne();

  return new ApiResponse(200, null, 'Asset deleted successfully').send(res);
});

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
};
