const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { allUsers, updateProfile } = require('../controllers/userController');

const router = express.Router();

router.route('/').get(protect, allUsers);
router.route('/profile').put(protect, updateProfile);

module.exports = router;
