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
exports.Login = void 0;
const tsyringe_1 = require("tsyringe");
const dotenv_1 = __importDefault(require("dotenv"));
const AuthService_1 = require("../services/AuthService");
const Autherror_1 = require("../../domain/errors/Autherror");
const Tokens_1 = require("../../constants/Tokens");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
dotenv_1.default.config();
let Login = class Login {
    constructor(userRepository, driverRepository, hashService) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.hashService = hashService;
    }
    async execute(email, password, role) {
        let user;
        // --- User / Admin login ---
        if (role === "user" || role === "admin") {
            const found = await this.userRepository.findByEmail(email);
            if (!found) {
                throw new Autherror_1.AuthError(`${role} not found. Please register.`, HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
            }
            user = found;
        }
        // --- Driver login ---
        else {
            const found = await this.driverRepository.findByEmail(email);
            if (!found) {
                throw new Autherror_1.AuthError("Driver not found. Please register.", HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
            }
            if (found.status === "pending") {
                throw new Autherror_1.AuthError("Your account is under review. Please wait for approval.", HttpStatusCode_1.HTTP_STATUS_CODES.FORBIDDEN);
            }
            if (found.status === "rejected") {
                throw new Autherror_1.AuthError("Your registration has been rejected. Please contact support.", HttpStatusCode_1.HTTP_STATUS_CODES.FORBIDDEN);
            }
            user = found;
        }
        // --- Blocked check ---
        if (user.isBlock) {
            throw new Autherror_1.AuthError("Your account has been blocked. Please contact support.", HttpStatusCode_1.HTTP_STATUS_CODES.FORBIDDEN);
        }
        // --- Password check ---
        const validPassword = await this.hashService.compare(password, user.password);
        if (!validPassword) {
            throw new Autherror_1.AuthError("Invalid email or password.", HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
        }
        // --- Role check ---
        if (role !== user.role) {
            throw new Autherror_1.AuthError("Role mismatch. Please login with the correct role.", HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
        }
        // --- Token generation ---
        const accessToken = AuthService_1.AuthService.generateAccessToken({
            id: user._id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = AuthService_1.AuthService.generateRefreshToken({
            id: user._id,
            email: user.email,
            role: user.role,
        });
        return {
            accessToken,
            refreshToken,
            role: user.role,
        };
    }
};
exports.Login = Login;
exports.Login = Login = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IUSER_REPO)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __param(2, (0, tsyringe_1.inject)(Tokens_1.TOKENS.HASH_SERVICE)),
    __metadata("design:paramtypes", [Object, Object, Object])
], Login);
//# sourceMappingURL=Login.js.map