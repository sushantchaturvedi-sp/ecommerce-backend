const User = require('../models/User.models');
const asyncHandler = require('../middleware/async.middleware');
const ErrorResponse = require('../utils/errorResponse.utils');

// @desc      get all users
// @route     GET /api/v1/users
// @access    Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  let query;

  query = User.find();

  if (req.query.status !== null && req.query.status !== '') {
    query = query.regex('status', new RegExp(req.query.status, 'i'));
  }

  // Executing query
  const users = await query;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse('User not found'), 404);
  }

  res.status(200).json({
    success: true,
    data: users,
  });
});

// @desc      get a user
// @route     GET /api/v1/users/:id
// @access    Admin/Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      update a user
// @route     PUT /api/v1/users/:id
// @access    Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      toggle status of a user
// @route     PUT /api/v1/users/toggle/:id
// @access    Admin
exports.toggle = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (user.status === 'Banned') {
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'Allowed' } },
      {
        runValidators: true,
        new: true,
      }
    );
  } else {
    user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'user' },
      { $set: { status: 'Banned' } },
      {
        runValidators: true,
        new: true,
      }
    );
    if (!user) {
      return next(new ErrorResponse('Admin cannot be banned'), 400);
    }
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      delete a user
// @route     PUT /api/v1/users/:id
// @access    Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (user.role === 'admin') {
    return next(new ErrorResponse('Admin cannot be deleted', 404));
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get currently logged-in user's profile
// @route   GET /api/v1/users/profile
// @access  Private (logged-in users)
// users.controller.js

// exports.getCurrentUser = asyncHandler(async (req, res, next) => {
//   const user = await User.findById(req.user.id).select('username email'); // Select username and email

//   if (!user) {
//     return next(new ErrorResponse('User not found', 404));
//   }

//   res.status(200).json({ success: true, data: user });
// });

exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select(
    'username email phone address'
  ); // Select other fields as well

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({ success: true, data: user });
});

// @desc    Update currently logged-in user's profile
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateCurrentUser = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address, // nested object
  };

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  ).select('-password');

  if (!updatedUser) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});
