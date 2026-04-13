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
exports.DriverController = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../domain/errors/Autherror");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
const UseCaseTokens_1 = require("../../constants/UseCaseTokens");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
const Tokens_1 = require("../../constants/Tokens");
let DriverController = class DriverController {
    constructor(registerDriverUseCase, verifyOtpUsecase, loginUsecase, getDriverProfileUsecase, getUserDataUsecase, resendOtpUsecase, editDriverProfileUseCase, onboardDriverUseCase, getUserBookingsUsecase, verifyDriverPaymentAccount) {
        this.registerDriverUseCase = registerDriverUseCase;
        this.verifyOtpUsecase = verifyOtpUsecase;
        this.loginUsecase = loginUsecase;
        this.getDriverProfileUsecase = getDriverProfileUsecase;
        this.getUserDataUsecase = getUserDataUsecase;
        this.resendOtpUsecase = resendOtpUsecase;
        this.editDriverProfileUseCase = editDriverProfileUseCase;
        this.onboardDriverUseCase = onboardDriverUseCase;
        this.getUserBookingsUsecase = getUserBookingsUsecase;
        this.verifyDriverPaymentAccount = verifyDriverPaymentAccount;
    }
    async registerDriver(req, res, next) {
        try {
            const response = await await this.registerDriverUseCase.execute(req.body);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, ...response });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyOTPDriver(req, res, next) {
        try {
            const { email, otp } = req.body;
            if (otp.length < 6) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.OTP_INVALID, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            const { accessToken, refreshToken, user } = await this.verifyOtpUsecase.execute(email, otp, "driver");
            res.cookie(`driverRefreshToken`, refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.OK)
                .json({ success: true, accessToken, user });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password, role } = req.body;
            console.log(req.body);
            const { accessToken, refreshToken } = await this.loginUsecase.execute(email, password, role);
            const refreshTokenKey = `${role}RefreshToken`;
            res.cookie(refreshTokenKey, refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                accessToken,
                role,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getDriverProfile(req, res, next) {
        try {
            const driverId = req.user?.id;
            if (!driverId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.DRIVER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            const driver = await this.getDriverProfileUsecase.execute(driverId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, driver });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserById(req, res, next) {
        try {
            const userId = req.params.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            const user = await this.getUserDataUsecase.execute(userId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, user });
        }
        catch (error) {
            next(error);
        }
    }
    async editDriverProfile(req, res, next) {
        try {
            const driverId = req.params.id;
            const updateData = req.body;
            const updatedDriver = await this.editDriverProfileUseCase.execute(driverId, updateData);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, driver: updatedDriver });
        }
        catch (error) {
            next(error);
        }
    }
    async onboardDriver(req, res, next) {
        try {
            let { email, driverId } = req.body;
            if (!driverId) {
                driverId = req.user?.id;
            }
            if (!email || !driverId) {
                throw new Autherror_1.AuthError('Email and driverId are required', HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            const onboardingUrl = await this.onboardDriverUseCase.execute(email, driverId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ url: onboardingUrl });
        }
        catch (error) {
            next(error);
        }
    }
    async getBookingsForDriver(req, res, next) {
        const driverId = req.user?.id;
        if (!driverId) {
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.DRIVER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
        }
        const { page = 1, limit = 2 } = req.query;
        try {
            const paginatedBookings = await this.getUserBookingsUsecase.execute(driverId, Number(page), Number(limit));
            res.status(200).json({
                data: paginatedBookings.data,
                total: paginatedBookings.total,
                totalPages: paginatedBookings.totalPages,
                currentPage: paginatedBookings.page,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyAccount(req, res, next) {
        try {
            const { driverId } = req.body;
            await this.verifyDriverPaymentAccount.execute(driverId);
            res.json({ success: true, message: 'Payment activated for driver' });
        }
        catch (error) {
            next(error);
        }
    }
    async resendOTP(req, res, next) {
        try {
            const { email, role } = req.body;
            const result = await this.resendOtpUsecase.execute(email, role);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, message: result.message });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.DriverController = DriverController;
exports.DriverController = DriverController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.REGISTER_DRIVER_USECASE)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.VERIFY_OTP_USECAE)),
    __param(2, (0, tsyringe_1.inject)(Tokens_1.TOKENS.LOGIN_USECASE)),
    __param(3, (0, tsyringe_1.inject)(Tokens_1.TOKENS.GET_DRIVER_PROFILE_USECASE)),
    __param(4, (0, tsyringe_1.inject)(Tokens_1.TOKENS.GET_USER_DATA_USECASE)),
    __param(5, (0, tsyringe_1.inject)(Tokens_1.TOKENS.RESEND_OTP_USECASE)),
    __param(6, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.EDIT_DRIVER_PROFILE)),
    __param(7, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.ONBOARD_DRIVER_USECASE)),
    __param(8, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GET_USERBOOKINGS_USECASE)),
    __param(9, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.VERIFY_DRIVER_PAYMENT_ACCOUNT_USECASE)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], DriverController);
//# sourceMappingURL=DriverControler.js.map