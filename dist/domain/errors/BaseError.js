"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = void 0;
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
class BaseError extends Error {
    constructor(message, statusCode = HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Set the prototype explicitly to ensure instanceof works correctly
        Object.setPrototypeOf(this, new.target.prototype);
        // Capture stack trace, excluding constructor call from it
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BaseError = BaseError;
//# sourceMappingURL=BaseError.js.map