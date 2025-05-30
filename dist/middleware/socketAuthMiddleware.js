"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = void 0;
const AuthService_1 = require("../application/services/AuthService");
const socketAuthMiddleware = async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token)
        return next(new Error("No token"));
    try {
        const payload = AuthService_1.AuthService.verifyToken(token, "access");
        if (!payload)
            return next(new Error("Invalid token"));
        socket.data.user = payload; // You can strongly type this too if needed
        next();
    }
    catch (err) {
        next(new Error("Invalid token"));
    }
};
exports.socketAuthMiddleware = socketAuthMiddleware;
//# sourceMappingURL=socketAuthMiddleware.js.map