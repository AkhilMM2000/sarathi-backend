"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const zod_1 = require("zod");
const BaseError_1 = require("../domain/errors/BaseError");
const ErrorMessages_1 = require("../constants/ErrorMessages");
/**
 * Global Error Handler Middleware
 * Uses type narrowing (instanceof) to return appropriate status codes and messages.
 */
const errorHandler = (err, req, res, _next) => {
    // 1. Handle Domain/Application Errors (BaseError hierarchy)
    if (err instanceof BaseError_1.BaseError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }
    // 2. Handle JWT Library Errors specifically (True Type Narrowing)
    if (err instanceof jsonwebtoken_1.TokenExpiredError) {
        res.status(401).json({
            success: false,
            message: "Session expired. Please login again.",
        });
        return;
    }
    if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        res.status(401).json({
            success: false,
            message: "Invalid session token.",
        });
        return;
    }
    // 3. Handle Validation Errors (Zod)
    if (err instanceof zod_1.z.ZodError) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.issues,
        });
        return;
    }
    // 4. Fallback for unexpected or programming errors
    console.error("Unexpected error:", err);
    res.status(500).json({
        success: false,
        message: ErrorMessages_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map