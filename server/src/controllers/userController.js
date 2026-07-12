const User = require('../models/User');
const Department = require('../models/Department');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all users (directory) with filters
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  const { department, role, status, q, page = 1, limit = 50 } = req.query;

  const query = {};

  // Filters
  if (department) {
    query.department = department;
  }
  if (role) {
    query.role = role;
  }
  if (status) {
    query.status = status;
  }

  // Text search on name/email
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .populate('department', 'name')
    .select('-password')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ name: 1 });

  const total = await User.countDocuments(query);

  return new ApiResponse(
    200,
    {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    },
    'Users fetched successfully'
  ).send(res);
});

// @desc    Update user details (like department)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res, next) => {
  const { departmentId } = req.body;
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  if (departmentId !== undefined) {
    if (departmentId === null || departmentId === '') {
      user.department = null;
    } else {
      const dept = await Department.findById(departmentId);
      if (!dept) {
        return next(new ApiError(404, 'Department not found'));
      }
      user.department = departmentId;
    }
  }

  await user.save();

  const updatedUser = await User.findById(user._id)
    .populate('department', 'name')
    .select('-password');

  return new ApiResponse(200, updatedUser, 'User updated successfully').send(res);
});

// @desc    Promote/demote user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  const { id } = req.params;

  const allowedRoles = ['employee', 'department_head', 'asset_manager'];
  if (!allowedRoles.includes(role)) {
    return next(
      new ApiError(400, 'Invalid role. Roles can only be employee, department_head, or asset_manager')
    );
  }

  // Prevent self-demotion or modifying self
  if (req.user._id.toString() === id) {
    return next(new ApiError(400, 'You cannot change your own role'));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  // Prevent modifying an Admin
  if (user.role === 'admin') {
    return next(new ApiError(400, 'Cannot modify Admin accounts'));
  }

  user.role = role;
  await user.save();

  const updatedUser = await User.findById(user._id)
    .populate('department', 'name')
    .select('-password');

  return new ApiResponse(200, updatedUser, `User role promoted/demoted to ${role} successfully`).send(res);
});

// @desc    Toggle user active/inactive status
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!['Active', 'Inactive'].includes(status)) {
    return next(new ApiError(400, 'Status must be either Active or Inactive'));
  }

  // Prevent self-deactivation
  if (req.user._id.toString() === id) {
    return next(new ApiError(400, 'You cannot deactivate your own account'));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  if (user.role === 'admin') {
    return next(new ApiError(400, 'Cannot change status of Admin accounts'));
  }

  user.status = status;
  await user.save();

  const updatedUser = await User.findById(user._id)
    .populate('department', 'name')
    .select('-password');

  return new ApiResponse(
    200,
    updatedUser,
    `User account status updated to ${status} successfully`
  ).send(res);
});

module.exports = {
  getUsers,
  updateUser,
  updateUserRole,
  updateUserStatus,
};
