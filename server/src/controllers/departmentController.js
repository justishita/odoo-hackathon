const Department = require('../models/Department');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Helper to check for circular reference
const isCircularReference = async (childId, proposedParentId) => {
  if (!proposedParentId) return false;
  if (childId.toString() === proposedParentId.toString()) return true;

  let nextParentId = proposedParentId;
  while (nextParentId) {
    const parentDept = await Department.findById(nextParentId);
    if (!parentDept) break;

    if (parentDept.parentDepartment) {
      if (parentDept.parentDepartment.toString() === childId.toString()) {
        return true;
      }
      nextParentId = parentDept.parentDepartment;
    } else {
      break;
    }
  }
  return false;
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Protected (All roles)
const getDepartments = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  const filter = {};
  
  if (status) {
    filter.status = status;
  }

  const departments = await Department.find(filter)
    .populate('head', 'name email role')
    .populate('parentDepartment', 'name');

  return new ApiResponse(200, departments, 'Departments fetched successfully').send(res);
});

// @desc    Create new department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = asyncHandler(async (req, res, next) => {
  const { name, head, parentDepartment, status } = req.body;

  if (!name) {
    return next(new ApiError(400, 'Department name is required'));
  }

  // Check if name is unique
  const exists = await Department.findOne({ name: name.trim() });
  if (exists) {
    return next(new ApiError(400, 'Department name already exists'));
  }

  // Validate parent if provided
  if (parentDepartment) {
    const parent = await Department.findById(parentDepartment);
    if (!parent) {
      return next(new ApiError(404, 'Parent department not found'));
    }
  }

  // Validate head if provided
  if (head) {
    const user = await User.findById(head);
    if (!user) {
      return next(new ApiError(404, 'Assigned head user not found'));
    }
  }

  const department = await Department.create({
    name: name.trim(),
    head: head || null,
    parentDepartment: parentDepartment || null,
    status: status || 'Active',
  });

  const populated = await Department.findById(department._id)
    .populate('head', 'name email role')
    .populate('parentDepartment', 'name');

  return new ApiResponse(201, populated, 'Department created successfully').send(res);
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = asyncHandler(async (req, res, next) => {
  const { name, head, parentDepartment, status } = req.body;
  const { id } = req.params;

  const department = await Department.findById(id);
  if (!department) {
    return next(new ApiError(404, 'Department not found'));
  }

  // Enforce name uniqueness if changed
  if (name && name.trim() !== department.name) {
    const exists = await Department.findOne({ name: name.trim() });
    if (exists) {
      return next(new ApiError(400, 'Department name already exists'));
    }
    department.name = name.trim();
  }

  // Circular reference check
  if (parentDepartment) {
    const parentExists = await Department.findById(parentDepartment);
    if (!parentExists) {
      return next(new ApiError(404, 'Parent department not found'));
    }

    const isCircular = await isCircularReference(id, parentDepartment);
    if (isCircular) {
      return next(new ApiError(400, 'Circular dependency detected: Cannot assign a child or itself as parent department'));
    }
    department.parentDepartment = parentDepartment;
  } else if (parentDepartment === null) {
    department.parentDepartment = null;
  }

  // Validate head if changed
  if (head) {
    const user = await User.findById(head);
    if (!user) {
      return next(new ApiError(404, 'Assigned head user not found'));
    }
    department.head = head;
  } else if (head === null) {
    department.head = null;
  }

  if (status) {
    department.status = status;
  }

  await department.save();

  const populated = await Department.findById(department._id)
    .populate('head', 'name email role')
    .populate('parentDepartment', 'name');

  return new ApiResponse(200, populated, 'Department updated successfully').send(res);
});

// @desc    Deactivate department (soft-delete status update)
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const department = await Department.findById(id);
  if (!department) {
    return next(new ApiError(404, 'Department not found'));
  }

  department.status = 'Inactive';
  await department.save();

  return new ApiResponse(200, department, 'Department deactivated successfully').send(res);
});

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
