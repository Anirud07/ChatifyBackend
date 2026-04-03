const axios = require('axios');

// @desc    Download file from Cloudinary
// @route   GET /api/download
// @access  Protected
const downloadFile = async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ message: 'URL parameter is required' });
        }

        console.log('Downloading file from:', url);

        // Fetch file from Cloudinary as arraybuffer
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer'
        });

        // Extract filename from URL or use default
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1] || 'download';

        console.log('File fetched successfully, size:', response.data.length, 'bytes');

        // Set headers to force download
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
        res.setHeader('Content-Length', response.data.length);

        // Send the file data
        res.send(Buffer.from(response.data));
    } catch (error) {
        console.error('Download Error:', error.message);
        res.status(500).json({ message: 'Download failed', error: error.message });
    }
};

module.exports = { downloadFile };
