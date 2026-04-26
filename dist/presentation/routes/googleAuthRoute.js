"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tsyringe_1 = require("tsyringe");
const googleAuthController_1 = require("../controllers/googleAuthController");
const router = express_1.default.Router();
const controller = tsyringe_1.container.resolve(googleAuthController_1.GoogleauthController);
router.post("/google-signin", controller.googleAuth);
exports.default = router;
//# sourceMappingURL=googleAuthRoute.js.map