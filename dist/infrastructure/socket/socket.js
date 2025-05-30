"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const tsyringe_1 = require("tsyringe");
const saveMessagechat_1 = require("../../application/use_cases/saveMessagechat");
const UpdateUserData_1 = require("../../application/use_cases/User/UpdateUserData");
const EditDriverProfile_1 = require("../../application/use_cases/Driver/EditDriverProfile");
let io;
const initializeSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: 'http://localhost:5173',
        },
    });
    io.on('connection', (socket) => {
        // Join chat room
        socket.on('joinChat', async ({ bookingId, userId, userType }) => {
            console.log('Join chat room:', { bookingId, userId, userType });
            if (!bookingId || typeof bookingId !== 'string') {
                console.warn('Invalid bookingId:', bookingId);
                return;
            }
            socket.join(bookingId);
            io.emit('userStatusUpdate', {
                userId,
                onlineStatus: 'online',
                lastSeen: new Date().toISOString(),
            });
            if (userType === 'user') {
                const updateUser = tsyringe_1.container.resolve(UpdateUserData_1.UpdateUserData);
                await updateUser.execute(userId, { onlineStatus: 'online' });
            }
            else if (userType === 'driver') {
                const updateDriver = tsyringe_1.container.resolve(EditDriverProfile_1.EditDriverProfile);
                await updateDriver.execute(userId, { onlineStatus: 'online' });
            }
            console.log('Joined chat room:', bookingId);
        });
        // Send message to the chat
        socket.on('sendMessage', async ({ bookingId, senderId, senderRole, type, text, fileUrl, }) => {
            try {
                console.log('Send message:', { bookingId, senderId, senderRole, type, text, fileUrl });
                const validRoles = ['User', 'Driver', 'Admin'];
                const validTypes = ['text', 'image', 'pdf', 'doc'];
                // ✅ Validate inputs
                if (!bookingId ||
                    !senderId ||
                    !validRoles.includes(senderRole) ||
                    !validTypes.includes(type)) {
                    socket.emit('messageError', { error: 'Invalid message payload' });
                    return;
                }
                // Type-specific validation
                if (type === 'text' && !text) {
                    socket.emit('messageError', { error: 'Text message must include text' });
                    return;
                }
                if ((type === 'image' || type === 'pdf') && !fileUrl) {
                    socket.emit('messageError', { error: `${type.toUpperCase()} must include fileUrl` });
                    return;
                }
                // ✅ Save message to DB via use case
                const saveMessageToChat = tsyringe_1.container.resolve(saveMessagechat_1.SaveMessageUseCase);
                const newmsg = await saveMessageToChat.execute({
                    bookingId,
                    senderId,
                    senderRole,
                    type,
                    text,
                    fileUrl,
                });
                // ✅ Emit message immediately to the chat room
                io.to(bookingId).emit('receiveMessage', newmsg);
                // ✅ Acknowledge to sender
                socket.emit('messageSent', {
                    status: 'success',
                    message: newmsg,
                });
            }
            catch (error) {
                console.error('Error sending message:', error);
                socket.emit('messageError', {
                    error: 'Internal server error while sending message',
                });
            }
        });
        socket.on('messageDeleted', ({ roomId, messageId }) => {
            try {
                console.log('Message deleted:', { roomId, messageId });
                if (!roomId || !messageId) {
                    socket.emit('deleteMessageError', { error: 'Invalid bookingId or messageId' });
                    return;
                }
                io.to(roomId).emit('messageDeleted', messageId);
            }
            catch (error) {
                console.error('Error deleting message:', error);
                socket.emit('deleteMessageError', {
                    error: 'Internal server error while deleting message',
                });
            }
        });
        socket.on('leaveChat', async ({ bookingId, userId, userType }) => {
            try {
                socket.leave(bookingId);
                io.emit('userStatusUpdate', {
                    userId,
                    onlineStatus: 'offline',
                    lastSeen: new Date().toISOString(),
                });
                if (userType === 'user') {
                    const updateUser = tsyringe_1.container.resolve(UpdateUserData_1.UpdateUserData);
                    await updateUser.execute(userId, { onlineStatus: 'offline', lastSeen: new Date() });
                }
                else if (userType === 'driver') {
                    const updateDriver = tsyringe_1.container.resolve(EditDriverProfile_1.EditDriverProfile);
                    await updateDriver.execute(userId, { onlineStatus: 'offline', lastSeen: new Date() });
                }
            }
            catch (error) {
                console.error('Error leaving chat:', error);
                socket.emit('leaveChatError', {
                    error: 'Internal server error while leaving chat',
                });
            }
        });
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Socket disconnected:now', socket.id);
        });
    });
};
exports.initializeSocket = initializeSocket;
const getIO = () => {
    if (!io)
        throw new Error("Socket.io server not initialized");
    return io;
};
exports.getIO = getIO;
//# sourceMappingURL=socket.js.map