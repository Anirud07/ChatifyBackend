const mongoose = require('mongoose');

const chatSchema = mongoose.Schema(
    {
        chatName: { type: String, trim: true },
        isGroupChat: { type: Boolean, default: false },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
        groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        groupAvatar: { type: String, default: 'https://icon-library.com/images/group-icon/group-icon-0.jpg' },
    },
    { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
