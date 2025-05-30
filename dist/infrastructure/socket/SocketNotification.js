"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSocket = void 0;
const socket_1 = require("./socket");
const redisconfig_1 = require("../../config/redisconfig"); // your redis setup file
const NotificationSocket = () => {
    const io = (0, socket_1.getIO)();
    io.on("connection", (socket) => {
        socket.on("driver:online", async (driverId) => {
            await redisconfig_1.redis.set(`driver:socket:${driverId}`, socket.id);
            await redisconfig_1.redis.set(`socket:driver:${socket.id}`, driverId);
        });
        socket.on("user:online", async ({ userId }) => {
            await redisconfig_1.redis.set(`user:socket:${userId}`, socket.id);
            await redisconfig_1.redis.set(`socket:user:${socket.id}`, userId);
            console.log('user is online');
        });
        socket.on("disconnect", async () => {
            const driverId = await redisconfig_1.redis.get(`socket:driver:${socket.id}`);
            if (driverId) {
                await redisconfig_1.redis.del(`driver:socket:${driverId}`);
                await redisconfig_1.redis.del(`socket:driver:${socket.id}`);
                console.log(`Driver ${driverId} disconnected`);
            }
            // Try to clean up user socket
            const userId = await redisconfig_1.redis.get(`socket:user:${socket.id}`);
            if (userId) {
                await redisconfig_1.redis.del(`user:socket:${userId}`);
                await redisconfig_1.redis.del(`socket:user:${socket.id}`);
                console.log(`User ${userId} disconnected`);
            }
        });
    });
};
exports.NotificationSocket = NotificationSocket;
//# sourceMappingURL=SocketNotification.js.map