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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const AuthService_1 = require("../services/AuthService");
const Autherror_1 = require("../../domain/errors/Autherror");
const HashService_1 = require("../services/HashService");
dotenv_1.default.config();
let Login = class Login {
    constructor(userRepository, driverRepository, hashService) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.hashService = hashService;
    }
    async execute(email, password, role) {
        let user = null;
        if (role === "user" || role === "admin") {
            user = await this.userRepository.findByEmail(email);
            if (!user) {
                throw new Autherror_1.AuthError(`${role} not found register as user`, 401);
            }
        }
        else if (role === "driver") {
            user = await this.driverRepository.findByEmail(email);
            // if (user?.status === "pending") {
            //   throw new AuthError("Your account is under review. Please wait for approval.", 403);
            // }
            if (user?.status === "rejected") {
                throw new Autherror_1.AuthError("Your registration has been rejected. just clear your verification ", 403);
            }
        }
        if (user?.isBlock) {
            throw new Autherror_1.AuthError("Your account has been blocked. Please contact support.", 403);
        }
        const status = await this.hashService.compare(password, user?.password || '');
        console.log(status);
        if (user) {
            (await bcryptjs_1.default.compare(password, user.password));
        }
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            throw new Autherror_1.AuthError("Invalid email or password", 401);
        }
        // Ensure admin users are correctly assigned
        if (role === "user" && user.role === "admin") {
            role = "admin";
        }
        const accessToken = AuthService_1.AuthService.generateAccessToken({ id: user._id, email: user.email, role });
        const refreshToken = AuthService_1.AuthService.generateRefreshToken({ id: user._id, email: user.email, role });
        return {
            accessToken,
            refreshToken,
            role
        };
    }
};
exports.Login = Login;
exports.Login = Login = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IUserRepository")),
    __param(1, (0, tsyringe_1.inject)("IDriverRepository")),
    __param(2, (0, tsyringe_1.inject)("HashService")),
    __metadata("design:paramtypes", [Object, Object, HashService_1.HashService])
], Login);
//# sourceMappingURL=Login.js.map