"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tsyringe_1 = require("tsyringe");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
const UseCaseTokens_1 = require("../../constants/UseCaseTokens");
const ZodHelper_1 = require("../schemas/common/ZodHelper");
const AuthRequestDTO_1 = require("../schemas/auth/AuthRequestDTO");
const Autherror_1 = require("../../domain/errors/Autherror");
let AuthController = class AuthController {
    constructor(refreshTokenUseCase, forgotPasswordUseCase, resetPasswordUseCase, changePasswordUseCase) {
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.forgotPasswordUseCase = forgotPasswordUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
    }
    async refreshToken(req, res, next) {
        try {
            // 1. DTO Validation
            const { role } = ZodHelper_1.ZodHelper.validate(AuthRequestDTO_1.RefreshTokenSchema, req.body);
            const refreshTokenKey = `${role}RefreshToken`;
            const refreshToken = req.cookies[refreshTokenKey];
            if (!refreshToken) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.REFRESHTOKEN_NOTFOUND, HttpStatusCode_1.HTTP_STATUS_CODES.FORBIDDEN);
            }
            // 2. Execute
            const result = await this.refreshTokenUseCase.execute(refreshToken, role);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, accessToken: result });
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            // 1. DTO Validation
            const { email, role } = ZodHelper_1.ZodHelper.validate(AuthRequestDTO_1.ForgotPasswordSchema, req.body);
            // 2. Execute
            await this.forgotPasswordUseCase.execute(email, role);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                success: true,
                message: `check ${role} mail for reset password`
            });
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            // 1. DTO Validation
            const { token, newPassword, role } = ZodHelper_1.ZodHelper.validate(AuthRequestDTO_1.ResetPasswordSchema, req.body);
            // 2. Execute
            await this.resetPasswordUseCase.execute(token, newPassword, role);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                success: true,
                message: `${role} Password reset successful`,
            });
        }
        catch (error) {
            next(error);
        }
    }
    logout(req, res, next) {
        try {
            // 1. DTO Validation (Query params)
            const { role } = ZodHelper_1.ZodHelper.validate(AuthRequestDTO_1.LogoutSchema, req.query);
            // 2. Clear Cookie
            res.clearCookie(`${role}RefreshToken`, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                success: true,
                message: `${role} logout successful`
            });
        }
        catch (error) {
            next(error);
        }
    }
    async ChangePassword(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
            }
            // 1. DTO Validation
            const { oldPassword, newPassword, role } = ZodHelper_1.ZodHelper.validate(AuthRequestDTO_1.ChangePasswordSchema, req.body);
            // 2. Execute
            await this.changePasswordUseCase.execute(userId, oldPassword, newPassword, role);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                success: true,
                message: "Password changed successfully."
            });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.REFRESH_TOKEN_USECASE)),
    __param(1, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.FORGOT_PASSWORD_USECASE)),
    __param(2, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.RESET_PASSWORD_USECASE)),
    __param(3, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.CHANGE_PASSWORD_USECASE)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], AuthController);
//# sourceMappingURL=AuthController.js.map