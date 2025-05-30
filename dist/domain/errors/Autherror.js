"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = void 0;
class AuthError extends Error {
    constructor(message = "Authentication failed", statusCode = 401) {
        super(message);
        this.statusCode = statusCode;
        // Ensure the name property is properly set (useful for debugging)
        this.name = "AuthError";
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AuthError);
        }
    }
}
exports.AuthError = AuthError;
//# sourceMappingURL=Autherror.js.map