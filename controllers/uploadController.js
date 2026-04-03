const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Protected
const uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }

    const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            // Determine resource type based on file mimetype
            let resourceType = 'auto';
            if (req.file.mimetype.startsWith('video/')) {
                resourceType = 'video';
            } else if (req.file.mimetype.startsWith('image/')) {
                resourceType = 'image';
            } else {
                resourceType = 'raw'; // For PDFs and other documents
            }

            // Generate public_id from original filename (without extension for Cloudinary)
            const originalName = req.file.originalname;
            const timestamp = Date.now();
            const publicId = `${timestamp}_${originalName.replace(/\.[^/.]+$/, '')}`; // Remove extension for public_id

            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'chat-app',
                    resource_type: resourceType,
                    public_id: publicId,
                    use_filename: true
                },
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    try {
        console.log('Uploading file:', req.file.originalname, 'Type:', req.file.mimetype, 'Size:', req.file.size);
        const result = await streamUpload(req);
        console.log('Upload successful:', result.secure_url);
        res.json({
            url: result.secure_url,
            fileName: req.file.originalname, // Use original filename from multer
            fileSize: result.bytes
        });
    } catch (error) {
        console.error('Upload Error Details:', {
            message: error.message,
            stack: error.stack,
            error: error
        });
        res.status(500).json({
            message: 'Cloudinary Upload Failed',
            error: error.message
        });
    }
};

module.exports = { uploadImage };
