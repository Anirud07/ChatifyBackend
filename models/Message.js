const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, trim: true },
        chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        type: { type: String, default: 'text' }, // text, image, video, file, audio
        mediaUrl: { type: String },
        fileName: { type: String },
        fileSize: { type: Number },
        deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who deleted this message
    },
    { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
