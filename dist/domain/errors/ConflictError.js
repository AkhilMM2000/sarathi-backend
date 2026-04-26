"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = void 0;
const BaseError_1 = require("./BaseError");
class ConflictError extends BaseError_1.BaseError {
    constructor(message = "Resource already exists") {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
//# sourceMappingURL=ConflictError.js.map