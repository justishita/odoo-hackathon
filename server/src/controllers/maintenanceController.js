const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all maintenance tickets
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceTickets = asyncHandler(async (req, res, next) => {
  const { status } = req.query;

  const query = {};
  if (status) {
    query.status = status;
  }

  const tickets = await Maintenance.find(query)
    .populate('asset', 'name serialNumber status condition')
    .populate('assignee', 'name email')
    .sort({ createdAt: -1 });

  return new ApiResponse(200, tickets, 'Maintenance tickets fetched successfully').send(res);
});

// @desc    Create new maintenance ticket
// @route   POST /api/maintenance
// @access  Private
const createMaintenanceTicket = asyncHandler(async (req, res, next) => {
  const { asset, issue, priority, assignee, eta, notes } = req.body;

  if (!asset || !issue || !issue.trim()) {
    return next(new ApiError(400, 'Asset and issue description are required'));
  }

  // Ensure asset exists
  const assetObj = await Asset.findById(asset);
  if (!assetObj) {
    return next(new ApiError(404, 'Asset not found'));
  }

  // If assignee provided, validate user exists
  if (assignee) {
    const userObj = await User.findById(assignee);
    if (!userObj) {
      return next(new ApiError(404, 'Assignee not found'));
    }
  }

  // Create ticket
  const ticket = await Maintenance.create({
    asset,
    issue: issue.trim(),
    priority: priority || 'Medium',
    status: 'Open',
    assignee: assignee || null,
    eta: eta || null,
    notes: notes || '',
  });

  // Flag asset status as Maintenance
  assetObj.status = 'Maintenance';
  await assetObj.save();

  const populated = await Maintenance.findById(ticket._id)
    .populate('asset', 'name serialNumber status condition')
    .populate('assignee', 'name email');

  return new ApiResponse(201, populated, 'Maintenance ticket registered successfully').send(res);
});

// @desc    Update maintenance ticket
// @route   PUT /api/maintenance/:id
// @access  Private
const updateMaintenanceTicket = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { issue, priority, status, assignee, eta, notes } = req.body;

  const ticket = await Maintenance.findById(id);
  if (!ticket) {
    return next(new ApiError(404, 'Maintenance ticket not found'));
  }

  if (issue !== undefined) {
    ticket.issue = issue.trim();
  }
  if (priority !== undefined) {
    ticket.priority = priority;
  }
  if (notes !== undefined) {
    ticket.notes = notes.trim();
  }
  if (eta !== undefined) {
    ticket.eta = eta || null;
  }

  if (assignee !== undefined) {
    if (assignee === null || assignee === '' || assignee === 'none') {
      ticket.assignee = null;
    } else {
      const userObj = await User.findById(assignee);
      if (!userObj) {
        return next(new ApiError(404, 'Assignee not found'));
      }
      ticket.assignee = assignee;
    }
  }

  const prevStatus = ticket.status;
  if (status !== undefined) {
    ticket.status = status;
  }

  await ticket.save();

  // If status transitioned to Resolved or Closed, release asset status to Available
  if (status !== undefined && (status === 'Resolved' || status === 'Closed') && prevStatus !== 'Resolved' && prevStatus !== 'Closed') {
    const assetObj = await Asset.findById(ticket.asset);
    if (assetObj) {
      assetObj.status = 'Available';
      await assetObj.save();
    }
  }

  const populated = await Maintenance.findById(ticket._id)
    .populate('asset', 'name serialNumber status condition')
    .populate('assignee', 'name email');

  return new ApiResponse(200, populated, 'Maintenance ticket updated successfully').send(res);
});

module.exports = {
  getMaintenanceTickets,
  createMaintenanceTicket,
  updateMaintenanceTicket,
};
