"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = void 0;
const BaseError_1 = require("./BaseError");
class AuthError extends BaseError_1.BaseError {
    constructor(message, statusCode = 400) {
        super(message, statusCode);
    }
}
exports.AuthError = AuthError;
//# sourceMappingURL=Autherror.js.map