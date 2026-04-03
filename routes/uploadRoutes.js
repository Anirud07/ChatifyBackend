const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadImage } = require('../controllers/uploadController');

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadImage);

module.exports = router;
