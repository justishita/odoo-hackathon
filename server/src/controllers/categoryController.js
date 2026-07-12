const AssetCategory = require('../models/AssetCategory');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Protected (All roles)
const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await AssetCategory.find({});
  return new ApiResponse(200, categories, 'Asset categories fetched successfully').send(res);
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description, customFields } = req.body;

  if (!name) {
    return next(new ApiError(400, 'Category name is required'));
  }

  // Validate unique name
  const exists = await AssetCategory.findOne({ name: name.trim() });
  if (exists) {
    return next(new ApiError(400, 'Category name already exists'));
  }

  // Validate customFields structure if present
  if (customFields && Array.isArray(customFields)) {
    for (const field of customFields) {
      if (!field.label || !field.fieldType) {
        return next(new ApiError(400, 'Custom fields must contain both label and fieldType'));
      }
      if (!['text', 'number', 'date'].includes(field.fieldType)) {
        return next(new ApiError(400, 'Custom fieldType must be text, number, or date'));
      }
    }
  }

  const category = await AssetCategory.create({
    name: name.trim(),
    description: description || '',
    customFields: customFields || [],
  });

  return new ApiResponse(201, category, 'Asset category created successfully').send(res);
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res, next) => {
  const { name, description, customFields } = req.body;
  const { id } = req.params;

  const category = await AssetCategory.findById(id);
  if (!category) {
    return next(new ApiError(404, 'Asset category not found'));
  }

  // Enforce name uniqueness if changed
  if (name && name.trim() !== category.name) {
    const exists = await AssetCategory.findOne({ name: name.trim() });
    if (exists) {
      return next(new ApiError(400, 'Category name already exists'));
    }
    category.name = name.trim();
  }

  if (description !== undefined) {
    category.description = description;
  }

  // Validate customFields structure if changed
  if (customFields && Array.isArray(customFields)) {
    for (const field of customFields) {
      if (!field.label || !field.fieldType) {
        return next(new ApiError(400, 'Custom fields must contain both label and fieldType'));
      }
      if (!['text', 'number', 'date'].includes(field.fieldType)) {
        return next(new ApiError(400, 'Custom fieldType must be text, number, or date'));
      }
    }
    category.customFields = customFields;
  }

  await category.save();

  return new ApiResponse(200, category, 'Asset category updated successfully').send(res);
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await AssetCategory.findById(id);
  if (!category) {
    return next(new ApiError(404, 'Asset category not found'));
  }

  await category.deleteOne();

  return new ApiResponse(200, null, 'Asset category deleted successfully').send(res);
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
