const multer = require('multer');

// Store file in memory to allow Cloudinary buffer upload
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit for videos
    }
});

module.exports = upload;
