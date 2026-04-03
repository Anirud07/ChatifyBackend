const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    status: { type: String, default: "offline" }, // online, offline
    lastSeen: { type: Date, default: Date.now },
    musicStatus: {
        song: String,
        artist: String,
        albumArt: String,
        audioUrl: String,    // Preview URL from iTunes
        statusImage: String, // User uploaded status image
        filterClass: String, // CSS filter class
        caption: String,     // Text caption
        timestamp: Number,
        isPlaying: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
