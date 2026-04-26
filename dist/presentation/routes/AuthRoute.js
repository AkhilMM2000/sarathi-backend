"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const express_1 = __importDefault(require("express"));
const tsyringe_1 = require("tsyringe");
const Tokens_1 = require("../../constants/Tokens");
const Routes_1 = require("../../constants/Routes");
const router = express_1.default.Router();
exports.authController = tsyringe_1.container.resolve(Tokens_1.TOKENS.AUTH_CONTROLLER);
router
    .post(Routes_1.ROUTES.AUTH.REFRESH_TOKEN, exports.authController.refreshToken.bind(exports.authController))
    .post(Routes_1.ROUTES.AUTH.FORGOT_PASSWORD, exports.authController.forgotPassword.bind(exports.authController))
    .post(Routes_1.ROUTES.AUTH.RESET_PASSWORD, exports.authController.resetPassword.bind(exports.authController))
    .patch(Routes_1.ROUTES.AUTH.CHANGE_PASSWORD, exports.authController.ChangePassword.bind(exports.authController))
    .post(Routes_1.ROUTES.AUTH.LOGOUT, exports.authController.logout.bind(exports.authController));
exports.default = router;
//# sourceMappingURL=AuthRoute.js.map