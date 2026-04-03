const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { allMessages, sendMessage, deleteMessage, markAsRead, markAllAsRead } = require('../controllers/messageController');

const router = express.Router();

router.route('/:chatId').get(protect, allMessages);
router.route('/').post(protect, sendMessage);
router.route('/:id').delete(protect, deleteMessage);
router.route('/:id/read').put(protect, markAsRead);
router.route('/read/:chatId').put(protect, markAllAsRead);

module.exports = router;
