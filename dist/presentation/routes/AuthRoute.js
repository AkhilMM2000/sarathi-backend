"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controllers/AuthController");
const router = express_1.default.Router();
router
    .post('/refresh-token', AuthController_1.AuthController.refreshToken)
    .post('/forgot-password', AuthController_1.AuthController.forgotPassword)
    .post('/reset-password', AuthController_1.AuthController.resetPassword)
    .patch('/change-password', AuthController_1.AuthController.ChangePassword)
    .post('/logout', AuthController_1.AuthController.logout);
exports.default = router;
//# sourceMappingURL=AuthRoute.js.map