"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1m" });
    }
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    }
    static verifyToken(token, type) {
        try {
            const secret = type === "access"
                ? process.env.ACCESS_TOKEN_SECRET
                : process.env.REFRESH_TOKEN_SECRET;
            return jsonwebtoken_1.default.verify(token, secret);
        }
        catch (error) {
            return null;
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map