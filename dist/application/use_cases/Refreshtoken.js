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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenUseCase = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tsyringe_1 = require("tsyringe");
const AuthService_1 = require("../services/AuthService");
const Autherror_1 = require("../../domain/errors/Autherror");
const Tokens_1 = require("../../constants/Tokens");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
let RefreshTokenUseCase = class RefreshTokenUseCase {
    constructor(userRepository, driverRepository) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
    }
    async execute(refreshToken, role) {
        if (!refreshToken) {
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.REFRESHTOKEN_NOTFOUND, HttpStatusCode_1.HTTP_STATUS_CODES.FORBIDDEN);
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        }
        catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new Autherror_1.AuthError("Refresh token expired. Please login again.", HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
            }
            throw new Autherror_1.AuthError("Invalid refresh token.", HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
        }
        let user = null;
        if (role === "user" || role === "admin") {
            user = await this.userRepository.findByEmail(decoded.email);
            if (!user) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
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
        if (!user) {
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
        }
        const accessToken = AuthService_1.AuthService.generateAccessToken({ id: user._id, email: user.email, role });
        return accessToken;
    }
};
exports.RefreshTokenUseCase = RefreshTokenUseCase;
exports.RefreshTokenUseCase = RefreshTokenUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IUSER_REPO)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __metadata("design:paramtypes", [Object, Object])
], RefreshTokenUseCase);
//# sourceMappingURL=Refreshtoken.js.map