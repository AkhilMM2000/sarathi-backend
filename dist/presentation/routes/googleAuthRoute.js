"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleAuthController_1 = require("../controllers/googleAuthController");
const router = express_1.default.Router();
router.post("/google-signin", googleAuthController_1.GoogleauthController.googleAuth);
exports.default = router;
//# sourceMappingURL=googleAuthRoute.js.map