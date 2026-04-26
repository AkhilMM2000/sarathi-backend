"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectRoute = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HttpStatusCode_1 = require("../constants/HttpStatusCode");
const protectRoute = (allowedRoles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED).json({ message: 'No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user = decoded;
            if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
                res.status(HttpStatusCode_1.HTTP_STATUS_CODES.FORBIDDEN).json({ message: 'Not authorized to access this route' });
                return;
            }
            next();
        }
        catch (err) {
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
            return;
        }
    };
};
exports.protectRoute = protectRoute;
//# sourceMappingURL=authMiddleware.js.map