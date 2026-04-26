"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = void 0;
const BaseError_1 = require("./BaseError");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
class AuthError extends BaseError_1.BaseError {
    constructor(message, statusCode = HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST) {
        super(message, statusCode);
    }
}
exports.AuthError = AuthError;
//# sourceMappingURL=Autherror.js.map