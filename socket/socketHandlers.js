const socketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('Connected to socket.io:', socket.id);

        socket.on('setup', async (userData) => {
            socket.join(userData._id);
            socket.emit('connected');

            // Set user as online
            const User = require('../models/User');
            await User.findByIdAndUpdate(userData._id, { isOnline: true });

            // Get all currently online users and send to the newly connected user
            const onlineUsers = await User.find({ isOnline: true }).select('_id');
            const onlineUserIds = onlineUsers.map(u => u._id.toString());
            socket.emit('online users', onlineUserIds);

            // Broadcast to all users that this user is online
            socket.broadcast.emit('user online', userData._id);
        });

        socket.on('join chat', (room) => {
            socket.join(room);
            console.log('User joined room: ' + room);
        });

        socket.on('typing', (room) => socket.in(room).emit('typing'));
        socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

        socket.on('new message', (newMessageReceived) => {
            var chat = newMessageReceived.chat;

            if (!chat.users) return console.log('Chat.users not defined');

            chat.users.forEach((user) => {
                if (user._id == newMessageReceived.sender._id) return;
                socket.in(user._id).emit('message received', newMessageReceived);
            });
        });

        socket.on('delete message', (data) => {
            const { messageId, chatId, deletedForEveryone } = data;
            // Broadcast to all users in the chat
            socket.in(chatId).emit('message deleted', { messageId, deletedForEveryone });
        });

        // Music/Status Update Event
        socket.on('music status update', async ({ userId, status }) => {
            console.log(`Socket: Received status update for ${userId}:`, status);
            try {
                // Here you would typically update the user in the DB
                const User = require('../models/User'); // Import locally if not at top
                await User.findByIdAndUpdate(userId, { musicStatus: status });
                console.log(`Socket: DB Updated for ${userId}`);

                // Broadcast to everyone (or just friends in a real app)
                socket.broadcast.emit('music status updated', { userId, status });
                console.log(`Socket: Broadcast sent`);
            } catch (error) {
                console.error("Error updating music status:", error);
            }
        });

        socket.on('user logout', async (userId) => {
            console.log('USER LOGGED OUT:', userId);

            // Set user as offline only on explicit logout
            const User = require('../models/User');
            await User.findByIdAndUpdate(userId, { isOnline: false });
            socket.broadcast.emit('user offline', userId);
        });
    });
};

module.exports = socketHandlers;
