"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleauthController = void 0;
const tsyringe_1 = require("tsyringe");
const googleAuth_1 = require("../../application/use_cases/Auth/googleAuth");
const catchAsync_1 = require("../../infrastructure/utils/catchAsync");
const tsyringe_2 = require("tsyringe");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
let GoogleauthController = class GoogleauthController {
    constructor() {
        this.googleAuth = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const { googleToken, role } = req.body;
            if (!googleToken) {
                res.status(HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "Google token is required!" });
                return;
            }
            const googleUseCase = tsyringe_2.container.resolve(googleAuth_1.GoogleAuthUseCase);
            const { accessToken, refreshToken, success } = await googleUseCase.execute(googleToken, role);
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: Number(process.env.COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                accessToken,
                role,
                success
            });
        });
    }
};
exports.GoogleauthController = GoogleauthController;
exports.GoogleauthController = GoogleauthController = __decorate([
    (0, tsyringe_1.injectable)()
], GoogleauthController);
//# sourceMappingURL=googleAuthController.js.map