"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeReferralSocket = void 0;
const tsyringe_1 = require("tsyringe");
const CreditReferalreward_1 = require("../../application/use_cases/User/CreditReferalreward");
const socket_1 = require("./socket");
const redisconfig_1 = require("../../config/redisconfig");
const initializeReferralSocket = () => {
    const io = (0, socket_1.getIO)();
    io.on("connection", (socket) => {
        socket.on("referalPay", async ({ userId }) => {
            const creditReward = tsyringe_1.container.resolve(CreditReferalreward_1.CreditReferralReward);
            try {
                await creditReward.execute(userId, 100); // ₹100
                socket.emit("referralRewarded", {
                    status: false,
                    message: "₹100 credited to your wallet",
                });
            }
            catch (err) {
                console.error("Error in referral payment:", err);
                socket.emit("referralRewarded", {
                    status: "error",
                    message: err.message,
                });
            }
        });
        //ridepayment success
        socket.on("walletRidepayment", ({ userId, rideId }) => {
            console.log("Received walletRidepayment:", userId, rideId);
            socket.broadcast.emit("walletRidepaymentSuccess", {
                rideId
            });
        });
        socket.on("cancelbooking", ({ rideId }) => {
            console.log("Cancel booking for ride:", rideId);
            socket.broadcast.emit("cancelbookingSuccess", {
                message: "Booking cancelled successfully",
                rideId,
            });
        });
        socket.on("ridePaymentSuccess", ({ rideId }) => {
            console.log("Ride payment success for:", rideId);
            // ✅ Emit success message back to the same client
            socket.broadcast.emit("ridePaymentSuccessAck", {
                message: "Payment received successfully!",
                rideId
            });
            // OR ✅ Broadcast to others (e.g., driver or admin panel)
            // socket.broadcast.emit("ridePaidNotification", { rideId });
        });
        socket.on("call:request", async ({ fromId, toId, callerName, role }) => {
            const receiverSocketId = await redisconfig_1.redis.get(role === "user" ? `driver:socket:${toId}` : `user:socket:${toId}`);
            console.log(receiverSocketId, 'reach here');
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("call:incoming", {
                    fromId,
                    callerName,
                    role,
                });
            }
            else {
                socket.emit("call:unavailable");
            }
        });
        // Backend: On call accept
        socket.on("call:accept", async ({ toId, role }) => {
            console.log(role);
            const targetSocketId = await redisconfig_1.redis.get(`user:socket:${toId}`) || await redisconfig_1.redis.get(`driver:socket:${toId}`);
            if (targetSocketId) {
                io.to(targetSocketId).emit("call:accepted", { role });
            }
        });
        // Backend: On call reject
        socket.on("call:reject", async ({ toId }) => {
            const targetSocketId = await redisconfig_1.redis.get(`user:socket:${toId}`) || await redisconfig_1.redis.get(`driver:socket:${toId}`);
            if (targetSocketId) {
                io.to(targetSocketId).emit("call:rejected");
            }
        });
        socket.on("offer", (offer) => {
            socket.broadcast.emit("offer", offer);
        });
        socket.on("answer", (answer) => {
            socket.broadcast.emit("answer", answer);
        });
        socket.on("call-ended", (role) => {
            socket.broadcast.emit("call-ended", { callEnder: role });
        });
        socket.on("ice-candidate", (candidate) => {
            socket.broadcast.emit("ice-candidate", candidate);
        });
        socket.on("ready-for-offer", () => {
            console.log(`[Socket] Receiver ${socket.id} is ready for offer refresh the page`);
            // Relay to the caller. You may want to emit to a specific room or user
            socket.broadcast.emit("ready-for-offer");
        });
    });
};
exports.initializeReferralSocket = initializeReferralSocket;
//# sourceMappingURL=referralSocket.js.map