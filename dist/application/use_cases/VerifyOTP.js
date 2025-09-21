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
exports.VerifyOTP = void 0;
const tsyringe_1 = require("tsyringe");
const dotenv_1 = __importDefault(require("dotenv"));
const Driverschema_1 = __importDefault(require("../../infrastructure/database/modals/Driverschema"));
const AuthService_1 = require("../services/AuthService");
const Autherror_1 = require("../../domain/errors/Autherror");
const WalletService_1 = require("../services/WalletService");
const ReferralCodeService_1 = require("../services/ReferralCodeService");
const Tokens_1 = require("../../constants/Tokens");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
dotenv_1.default.config();
let VerifyOTP = class VerifyOTP {
    constructor(userRepository, driverRepository, store, walletService, referralCodeService) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.store = store;
        this.walletService = walletService;
        this.referralCodeService = referralCodeService;
    }
    async execute(email, otp, role) {
        const userData = await this.store.getUser(email);
        console.log('userData', userData);
        if (!userData)
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
        if (userData.otp !== otp || userData.otpExpires < new Date())
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.OTP_INVALID, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
        // Choose repository based on role
        const repository = role === "user" ? this.userRepository : this.driverRepository;
        let savedUser;
        if (role === "driver") {
            // Remove unwanted fields before saving
            const { otp, otpExpires, confirmPassword, ...driverData } = userData;
            const existingDriver = await Driverschema_1.default.findOne({
                $or: [
                    { email: driverData.email },
                    { mobile: driverData.mobile },
                    { aadhaarNumber: driverData.aadhaarNumber },
                    { licenseNumber: driverData.licenseNumber },
                ],
            });
            if (existingDriver) {
                console.error("❌ Duplicate driver found:", existingDriver);
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.ALREDY_EXIST, HttpStatusCode_1.HTTP_STATUS_CODES.CONFLICT);
            }
            // Ensure necessary fields are set for drivers
            driverData.status = "pending";
            driverData.isBlock = false;
            driverData.role = "driver";
            console.log("📌 Saving driver to DB:", driverData);
            console.log("📝 Required Schema Fields:", Object.keys(Driverschema_1.default.schema.paths));
            // Save driver in the database
            savedUser = await repository.create(driverData);
        }
        else {
            console.log("📌 Saving user to DB:", userData);
            if (userData.referralCode) {
                const referalExists = await this.userRepository.findByReferralCode(userData.referralCode);
                if (referalExists) {
                    userData.referredBy = referalExists._id;
                    userData.referalPay = true;
                }
            }
            savedUser = await repository.create(userData);
            const loggesUser = await this.userRepository.findByEmail(userData.email);
            const code = this.referralCodeService.generate(loggesUser?._id?.toString());
            if (loggesUser?._id) {
                await this.userRepository.updateUser(loggesUser._id.toString(), { referralCode: code });
            }
            if (savedUser?._id) {
                await this.walletService.createWallet(savedUser._id.toString());
            }
        }
        if (!savedUser)
            console.log('user data doesnt get to you');
        console.log("✅ User successfully saved:", savedUser);
        console.log("📝 Required Schema Fields:", Object.keys(Driverschema_1.default.schema.paths));
        const accessToken = AuthService_1.AuthService.generateAccessToken({ id: savedUser._id, email: savedUser.email, role });
        const refreshToken = AuthService_1.AuthService.generateRefreshToken({ id: savedUser._id, email: savedUser.email, role });
        return {
            accessToken,
            refreshToken,
            user: {
                id: savedUser._id ? savedUser._id.toString() : "",
                role,
            },
        };
    }
};
exports.VerifyOTP = VerifyOTP;
exports.VerifyOTP = VerifyOTP = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IUSER_REPO)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __param(2, (0, tsyringe_1.inject)(Tokens_1.TOKENS.USER_REGISTERSTORE)),
    __param(3, (0, tsyringe_1.inject)(Tokens_1.TOKENS.WALLET_SERVICE)),
    __param(4, (0, tsyringe_1.inject)(Tokens_1.TOKENS.REFERAL_CODE_SERVICE)),
    __metadata("design:paramtypes", [Object, Object, Object, WalletService_1.WalletService,
        ReferralCodeService_1.ReferralCodeService])
], VerifyOTP);
//# sourceMappingURL=VerifyOTP.js.map