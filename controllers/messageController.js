const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

// @desc    Get all Messages
// @route   GET /api/messages/:chatId
// @access  Protected
const allMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate('sender', 'name avatar email')
            .populate('chat');

        // Filter out messages deleted by this user
        const filteredMessages = messages.filter(msg =>
            !msg.deletedFor.includes(req.user._id)
        );

        res.json(filteredMessages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Create New Message
// @route   POST /api/messages
// @access  Protected
const sendMessage = async (req, res) => {
    const { content, chatId, type, mediaUrl, fileName } = req.body;

    if (!content || !chatId) {
        console.log('Invalid data passed into request');
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        type: type || 'text',
        mediaUrl: mediaUrl,
        fileName: fileName
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate('sender', 'name avatar');
        message = await message.populate('chat');
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name avatar email',
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Delete Message
// @route   DELETE /api/messages/:id
// @access  Protected
const deleteMessage = async (req, res) => {
    try {
        const { deleteType } = req.body; // 'forMe' or 'forEveryone'
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (deleteType === 'forEveryone') {
            // Only sender can delete for everyone
            if (message.sender.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'You can only delete your own messages for everyone' });
            }
            // Actually delete the message
            await Message.findByIdAndDelete(req.params.id);
            res.json({ messageId: req.params.id, deletedForEveryone: true });
        } else {
            // Delete for me - add user to deletedFor array
            if (!message.deletedFor.includes(req.user._id)) {
                message.deletedFor.push(req.user._id);
                await message.save();
            }
            res.json({ messageId: req.params.id, deletedForMe: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete message' });
    }
};

// @desc    Mark Message as Read
// @route   PUT /api/messages/:id/read
// @access  Protected
const markAsRead = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (!message.readBy.includes(req.user._id)) {
            message.readBy.push(req.user._id);
            await message.save();
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark as read' });
    }
};

// @desc    Mark All Messages in Chat as Read
// @route   PUT /api/messages/read/:chatId
// @access  Protected
const markAllAsRead = async (req, res) => {
    try {
        const chatId = req.params.chatId;

        await Message.updateMany(
            {
                chat: chatId,
                readBy: { $ne: req.user._id }
            },
            {
                $addToSet: { readBy: req.user._id }
            }
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark messages as read' });
    }
};

module.exports = { allMessages, sendMessage, deleteMessage, markAsRead, markAllAsRead };
