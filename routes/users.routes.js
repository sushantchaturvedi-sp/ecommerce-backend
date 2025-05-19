// const express = require('express');

// const {
//   getUsers,
//   getUser,
//   updateUser,
//   deleteUser,
//   toggle,
// } = require('../controllers/users.controller');

// const router = express.Router();

// const { protect, authorize } = require('../middleware/auth.middleware');

// router.route('/').get(protect, authorize('admin'), getUsers);

// router.route('/toggle/:id').get(protect, authorize('admin'), toggle);

// router.route('/delete/:id').get(protect, authorize('admin'), deleteUser);

// router
//   .route('/update-address/:id')
//   .post(protect, authorize('admin', 'user'), updateUser);

// router.route('/:id').get(protect, authorize('admin', 'user'), getUser);

// module.exports = router;

const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggle,
  getCurrentUser,
  updateCurrentUser,
} = require('../controllers/users.controller');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// Add this route at the top to avoid conflict with '/:id'
router.get('/profile', protect, getCurrentUser);

router.put('/profile', protect, updateCurrentUser);

router.route('/').get(protect, authorize('admin'), getUsers);
router.route('/toggle/:id').get(protect, authorize('admin'), toggle);
router.route('/delete/:id').get(protect, authorize('admin'), deleteUser);
router
  .route('/update-address/:id')
  .post(protect, authorize('admin', 'user'), updateUser);
router.route('/:id').get(protect, authorize('admin', 'user'), getUser);

module.exports = router;
