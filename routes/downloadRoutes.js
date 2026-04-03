const express = require('express');
const { downloadFile } = require('../controllers/downloadController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, downloadFile);

module.exports = router;
