const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const auth = async (req, res, next) => {
  let token;

  // 1. Check for token in cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check for token in Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Authentication failed: No token provided'));
  }

  // Developer Bypass for Sandbox Testing
  if (token.startsWith('mock-') && process.env.NODE_ENV !== 'production') {
    try {
      const role = token.split('-')[1]; // e.g. mock-admin-token -> admin
      const email = `mock-${role}@assetflow.com`;
      
      let user = await User.findOne({ email }).select('-password');
      if (!user) {
        user = await User.create({
          name: `Mock ${role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
          email,
          password: 'mockpassword123', // Will be hashed via schema hook
          role,
          status: 'Active'
        });
        user = await User.findById(user._id).select('-password');
      }

      req.user = user;
      return next();
    } catch (err) {
      return next(new ApiError(401, `Authentication failed: Mock validation failed: ${err.message}`));
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new ApiError(401, 'Authentication failed: User not found'));
    }

    if (user.status === 'Inactive') {
      return next(new ApiError(403, 'Account is inactive. Please contact admin.'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Authentication failed: Invalid or expired token'));
  }
};

module.exports = auth;
