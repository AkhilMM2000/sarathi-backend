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
dotenv_1.default.config();
let VerifyOTP = class VerifyOTP {
    constructor(userRepository, driverRepository, store, walletService, referralCodeService) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.store = store;
        this.walletService = walletService;
        this.referralCodeService = referralCodeService;
    }
    async execute(req, res, email, otp, role) {
        const userData = await this.store.getUser(email);
        console.log('userData', userData);
        if (!userData)
            throw new Error("Register again, data not found");
        if (userData.otp !== otp || userData.otpExpires < new Date())
            throw new Autherror_1.AuthError("Invalid or expired OTP", 400);
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
                throw new Autherror_1.AuthError("A driver with this email, mobile, Aadhaar, or license number already exists.", 409);
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
        res.cookie(`${role}RefreshToken`, refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        console.log("✅ Tokens generated & refreshToken set in cookies");
        return {
            accessToken,
            user: { id: savedUser._id, role },
        };
    }
};
exports.VerifyOTP = VerifyOTP;
exports.VerifyOTP = VerifyOTP = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IUserRepository")),
    __param(1, (0, tsyringe_1.inject)("IDriverRepository")),
    __param(2, (0, tsyringe_1.inject)("UserRegistrationStore")),
    __param(3, (0, tsyringe_1.inject)("WalletService")),
    __param(4, (0, tsyringe_1.inject)("ReferralCodeService")),
    __metadata("design:paramtypes", [Object, Object, Object, WalletService_1.WalletService,
        ReferralCodeService_1.ReferralCodeService])
], VerifyOTP);
//# sourceMappingURL=VerifyOTP.js.map