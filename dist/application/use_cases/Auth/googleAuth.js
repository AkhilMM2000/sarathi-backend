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
exports.GoogleAuthUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const google_auth_library_1 = require("google-auth-library");
const AuthService_1 = require("../../services/AuthService");
const Autherror_1 = require("../../../domain/errors/Autherror");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let GoogleAuthUseCase = class GoogleAuthUseCase {
    constructor(userRepository, driverRepository) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }
    async execute(googleToken, role) {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: googleToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload)
                throw new Autherror_1.AuthError("Invalid Google token", 400);
            const { email, given_name, sub: googleId } = payload;
            if (!email)
                throw new Autherror_1.AuthError("Google account email is required", 400);
            let user;
            if (role === "user") {
                user = await this.userRepository.findByEmail(email);
                if (!user) {
                    // Register new user
                    user = await this.userRepository.create({
                        email,
                        name: given_name || "Google User",
                        googleId,
                        mobile: "", // Empty string as default
                        password: '', // No password for Google users
                        profile: "default-profile.png", // Default profile image
                        role: "user",
                        isBlock: false,
                        lastSeen: new Date(),
                        onlineStatus: "offline",
                    });
                }
            }
            else if (role === "driver") {
                user = await this.driverRepository.findByEmail(email);
                if (!user) {
                    throw new Autherror_1.AuthError("Driver not registered", 401);
                }
            }
            if (!user) {
                throw new Autherror_1.AuthError('Not found user ', 401);
            }
            const accessToken = AuthService_1.AuthService.generateAccessToken({
                id: user._id,
                email: user.email,
                role,
            });
            const refreshToken = AuthService_1.AuthService.generateRefreshToken({
                id: user._id,
                email: user.email,
                role,
            });
            return { accessToken, refreshToken, success: true };
        }
        catch (error) {
            console.error(error);
            throw new Autherror_1.AuthError("Google authentication failed", 401);
        }
    }
};
exports.GoogleAuthUseCase = GoogleAuthUseCase;
exports.GoogleAuthUseCase = GoogleAuthUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IUserRepository")),
    __param(1, (0, tsyringe_1.inject)("IDriverRepository")),
    __metadata("design:paramtypes", [Object, Object])
], GoogleAuthUseCase);
//# sourceMappingURL=googleAuth.js.map