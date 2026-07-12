const Booking = require('../models/Booking');
const Asset = require('../models/Asset');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = asyncHandler(async (req, res, next) => {
  const { status } = req.query;

  const query = {};
  if (status) {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .populate('asset', 'name serialNumber')
    .populate({
      path: 'user',
      select: 'name email department',
      populate: {
        path: 'department',
        select: 'name',
      },
    })
    .sort({ createdAt: -1 });

  return new ApiResponse(200, bookings, 'Bookings fetched successfully').send(res);
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res, next) => {
  const { asset, room, startDate, endDate, purpose } = req.body;

  if (!asset || !startDate || !endDate || !purpose || !purpose.trim()) {
    return next(new ApiError(400, 'Asset, startDate, endDate, and purpose are required'));
  }

  // Ensure asset exists
  const assetObj = await Asset.findById(asset);
  if (!assetObj) {
    return next(new ApiError(404, 'Asset not found'));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) {
    return next(new ApiError(400, 'End date cannot be earlier than start date'));
  }

  const booking = await Booking.create({
    asset,
    user: req.user._id,
    room: room || '',
    startDate: start,
    endDate: end,
    purpose: purpose.trim(),
    status: 'Pending', // Defaults to Pending, requires approval
  });

  const populated = await Booking.findById(booking._id)
    .populate('asset', 'name serialNumber')
    .populate({
      path: 'user',
      select: 'name email department',
      populate: {
        path: 'department',
        select: 'name',
      },
    });

  return new ApiResponse(201, populated, 'Booking request created successfully').send(res);
});

// @desc    Approve/Decline booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private/Admin,AssetManager,DepartmentHead
const updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Confirmed', 'Completed', 'Cancelled'].includes(status)) {
    return next(new ApiError(400, 'Invalid status. Can only set to Confirmed, Completed, or Cancelled'));
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new ApiError(404, 'Booking not found'));
  }

  booking.status = status;
  await booking.save();

  const populated = await Booking.findById(booking._id)
    .populate('asset', 'name serialNumber')
    .populate({
      path: 'user',
      select: 'name email department',
      populate: {
        path: 'department',
        select: 'name',
      },
    });

  return new ApiResponse(200, populated, `Booking request updated to ${status} successfully`).send(res);
});

module.exports = {
  getBookings,
  createBooking,
  updateBookingStatus,
};
