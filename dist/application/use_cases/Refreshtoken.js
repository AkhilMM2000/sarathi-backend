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
exports.RefreshToken = void 0;
const tsyringe_1 = require("tsyringe");
const Tokens_1 = require("../../constants/Tokens");
const AuthService_1 = require("../services/AuthService");
const Autherror_1 = require("../../domain/errors/Autherror");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
let RefreshToken = class RefreshToken {
    constructor(userRepository, driverRepository) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
    }
    async execute(refreshToken) {
        if (!refreshToken) {
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.REFRESHTOKEN_NOTFOUND, HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
        }
        // 1. Verify and Decode token using the AuthService
        const decoded = AuthService_1.AuthService.verifyToken(refreshToken, "refresh");
        if (!decoded || !decoded.role) {
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.INVALID_TOKEN, HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
        }
        const { role } = decoded;
        // 2. Fetch User based on role found in the token
        let user = null;
        if (role === "user" || role === "admin") {
            user = await this.userRepository.findByEmail(decoded.email);
            if (!user) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            // Verify if admin role is actually authorized
            if (role === "admin" && user.role !== "admin") {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.NOT_AUTHORIZED_ADMIN, HttpStatusCode_1.HTTP_STATUS_CODES.FORBIDDEN);
            }
        }
        else if (role === "driver") {
            user = await this.driverRepository.findByEmail(decoded.email);
            if (!user) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.DRIVER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
        }
        // 3. Generate new Access Token
        return AuthService_1.AuthService.generateAccessToken({
            id: user._id || user.id,
            email: user.email,
            role
        });
    }
};
exports.RefreshToken = RefreshToken;
exports.RefreshToken = RefreshToken = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IUSER_REPO)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __metadata("design:paramtypes", [Object, Object])
], RefreshToken);
//# sourceMappingURL=Refreshtoken.js.map