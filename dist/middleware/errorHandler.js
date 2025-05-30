"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const Autherror_1 = require("../domain/errors/Autherror");
function errorHandler(err, req, res, next) {
    if (err instanceof Autherror_1.AuthError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
    console.error("Unhandled Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
}
//# sourceMappingURL=errorHandler.js.map