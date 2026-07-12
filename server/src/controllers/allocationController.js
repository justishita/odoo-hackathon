const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all allocations with filters
// @route   GET /api/allocations
// @access  Private
const getAllocations = asyncHandler(async (req, res, next) => {
  const { status, q } = req.query;

  const query = {};
  if (status) {
    query.status = status;
  }

  let allocations = await Allocation.find(query)
    .populate('asset', 'name serialNumber status condition')
    .populate('user', 'name email department')
    .populate('department', 'name')
    .sort({ createdAt: -1 });

  // Dynamically compute Overdue status if Active and endDate has passed
  const today = new Date();
  const updatedAllocations = [];

  for (let allocation of allocations) {
    let wasUpdated = false;
    if (allocation.status === 'Active' && new Date(allocation.endDate) < today) {
      allocation.status = 'Overdue';
      wasUpdated = true;
      await allocation.save();
    }
    
    // Convert to JSON and add virtual calculations
    const allocationJson = allocation.toJSON();
    const diffTime = new Date(allocation.endDate) - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    allocationJson.daysLeft = diffDays;

    updatedAllocations.push(allocationJson);
  }

  // Filter by search query if present (checks asset name or user name)
  let filtered = updatedAllocations;
  if (q) {
    const searchRegex = new RegExp(q, 'i');
    filtered = updatedAllocations.filter(
      (a) =>
        searchRegex.test(a.asset?.name) ||
        searchRegex.test(a.asset?.serialNumber) ||
        searchRegex.test(a.user?.name)
    );
  }

  return new ApiResponse(200, filtered, 'Allocations fetched successfully').send(res);
});

// @desc    Create a new asset allocation
// @route   POST /api/allocations
// @access  Private/Admin,AssetManager
const createAllocation = asyncHandler(async (req, res, next) => {
  const { asset, user, startDate, endDate, notes } = req.body;

  if (!asset || !user || !startDate || !endDate) {
    return next(new ApiError(400, 'Asset, user, startDate, and endDate are required'));
  }

  // Ensure asset exists and is available
  const assetObj = await Asset.findById(asset);
  if (!assetObj) {
    return next(new ApiError(404, 'Asset not found'));
  }
  if (assetObj.status !== 'Available') {
    return next(new ApiError(400, `Asset is not available for allocation. Current status: ${assetObj.status}`));
  }

  // Ensure user exists
  const userObj = await User.findById(user);
  if (!userObj) {
    return next(new ApiError(404, 'User not found'));
  }

  // Determine allocation status
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) {
    return next(new ApiError(400, 'End date cannot be earlier than start date'));
  }

  const today = new Date();
  let status = 'Active';
  if (start > today) {
    status = 'Pending';
  } else if (end < today) {
    status = 'Overdue';
  }

  // Create allocation
  const allocation = await Allocation.create({
    asset,
    user,
    department: userObj.department || null,
    startDate: start,
    endDate: end,
    status,
    notes: notes || '',
  });

  // Update asset status
  assetObj.status = 'Allocated';
  assetObj.allocatedTo = user;
  assetObj.department = userObj.department || null;
  await assetObj.save();

  const populated = await Allocation.findById(allocation._id)
    .populate('asset', 'name serialNumber status condition')
    .populate('user', 'name email')
    .populate('department', 'name');

  return new ApiResponse(201, populated, 'Asset allocated successfully').send(res);
});

// @desc    Return allocated asset
// @route   PUT /api/allocations/:id/return
// @access  Private/Admin,AssetManager
const returnAllocation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const allocation = await Allocation.findById(id);
  if (!allocation) {
    return next(new ApiError(404, 'Allocation not found'));
  }

  if (allocation.status === 'Returned') {
    return next(new ApiError(400, 'Asset has already been returned for this allocation'));
  }

  // Update allocation
  allocation.status = 'Returned';
  await allocation.save();

  // Reset asset status
  const assetObj = await Asset.findById(allocation.asset);
  if (assetObj) {
    assetObj.status = 'Available';
    assetObj.allocatedTo = null;
    assetObj.department = null;
    await assetObj.save();
  }

  const populated = await Allocation.findById(allocation._id)
    .populate('asset', 'name serialNumber status condition')
    .populate('user', 'name email')
    .populate('department', 'name');

  return new ApiResponse(200, populated, 'Asset marked as returned successfully').send(res);
});

module.exports = {
  getAllocations,
  createAllocation,
  returnAllocation,
};
