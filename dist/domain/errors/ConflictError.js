"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = void 0;
const BaseError_1 = require("./BaseError");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
class ConflictError extends BaseError_1.BaseError {
    constructor(message = "Resource already exists") {
        super(message, HttpStatusCode_1.HTTP_STATUS_CODES.CONFLICT);
    }
}
exports.ConflictError = ConflictError;
//# sourceMappingURL=ConflictError.js.map