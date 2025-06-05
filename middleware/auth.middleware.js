const jwt = require('jsonwebtoken');
const User = require('../models/User.models');
const asyncHandler = require('./async.middleware');
const ErrorResponse = require('../utils/errorResponse.utils');

// Check user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Please login to access', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (req.user.status === 'Banned') {
      return next(new ErrorResponse('You are blocked by admin', 401));
    }

    next();
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse('Please login to access', 401));
  }
});

// Admin authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse('Not Authorized to access this route', 401)
      );
    }

    next();
  };
};


