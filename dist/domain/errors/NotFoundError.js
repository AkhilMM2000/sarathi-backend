"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const BaseError_1 = require("./BaseError");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
class NotFoundError extends BaseError_1.BaseError {
    constructor(message = "Resource not found") {
        super(message, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
    }
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=NotFoundError.js.map