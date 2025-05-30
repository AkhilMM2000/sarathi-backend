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
exports.RefreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tsyringe_1 = require("tsyringe");
const AuthService_1 = require("../services/AuthService");
const Autherror_1 = require("../../domain/errors/Autherror");
let RefreshToken = class RefreshToken {
    constructor(userRepository, driverRepository) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
    }
    async execute(refreshToken, role) {
        if (!refreshToken) {
            throw new Autherror_1.AuthError("No refresh token provided", 403);
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            let user = null;
            if (role === "user" || role === "admin") {
                user = await this.userRepository.findByEmail(decoded.email);
                if (!user) {
                    throw new Autherror_1.AuthError("User not found", 404);
                }
                if (role === "admin" && user.role !== "admin") {
                    throw new Autherror_1.AuthError("Not authorized as admin", 403);
                }
            }
            else if (role === "driver") {
                user = await this.driverRepository.findByEmail(decoded.email);
                if (!user) {
                    throw new Autherror_1.AuthError("Driver not found", 404);
                }
            }
            if (!user) {
                throw new Autherror_1.AuthError("User not found", 404);
            }
            const accessToken = AuthService_1.AuthService.generateAccessToken({ id: user._id, email: user.email, role });
            return { success: true, accessToken };
        }
        catch (error) {
            throw new Autherror_1.AuthError("Invalid refresh token", 403);
        }
    }
};
exports.RefreshToken = RefreshToken;
exports.RefreshToken = RefreshToken = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IUserRepository")),
    __param(1, (0, tsyringe_1.inject)("IDriverRepository")),
    __metadata("design:paramtypes", [Object, Object])
], RefreshToken);
//# sourceMappingURL=Refreshtoken.js.map