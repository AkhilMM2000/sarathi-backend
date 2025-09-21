"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const Autherror_1 = require("../domain/errors/Autherror");
const ErrorMessages_1 = require("../constants/ErrorMessages");
const errorHandler = (err, req, res, _next) => {
    if (err instanceof Autherror_1.AuthError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }
    console.error("Unexpected error:", err);
    res.status(500).json({
        success: false,
        message: ErrorMessages_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map