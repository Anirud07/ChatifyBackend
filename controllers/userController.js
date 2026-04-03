const User = require('../models/User');

// @desc    Get or Search all users
// @route   GET /api/users?search=name
// @access  Protected
const allUsers = async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ],
        }
        : {};

    console.log("Search Keyword:", JSON.stringify(keyword, null, 2));
    console.log("Requesting User:", req.user?._id);

    try {
        const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
        console.log("Found Users:", users.length);
        res.send(users);
    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).send(err.message);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Protected
const updateProfile = async (req, res) => {
    try {
        const { name, bio, location, avatar } = req.body;

        const updateFields = {};
        if (name) updateFields.name = name;
        if (bio !== undefined) updateFields.bio = bio;
        if (location !== undefined) updateFields.location = location;
        if (avatar) updateFields.avatar = avatar;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields },
            { new: true, runValidators: false }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            location: updatedUser.location
        });
    } catch (error) {
        console.error('Profile update error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

module.exports = { allUsers, updateProfile };
