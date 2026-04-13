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
const ZodHelper_1 = require("../dto/common/ZodHelper");
const DriverRequestDTO_1 = require("../dto/driver/DriverRequestDTO");
const DriverDTO_1 = require("../dto/user/DriverDTO");
const UserDTO_1 = require("../dto/user/UserDTO");
const zod_1 = require("zod");
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
            // 1. DTO Validation
            const validatedData = ZodHelper_1.ZodHelper.validate(DriverRequestDTO_1.RegisterDriverSchema, req.body);
            // 2. Execute
            const response = await this.registerDriverUseCase.execute(validatedData);
            // 3. Response
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, ...response });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST).json({
                    success: false,
                    errors: error.issues
                });
                return;
            }
            next(error);
        }
    }
    async verifyOTPDriver(req, res, next) {
        try {
            // 1. DTO Validation
            const { email, otp } = ZodHelper_1.ZodHelper.validate(DriverRequestDTO_1.VerifyDriverOtpSchema, req.body);
            // 2. Execute
            const { accessToken, refreshToken, user } = await this.verifyOtpUsecase.execute(email, otp, "driver");
            // 3. Set Cookie and Response
            res.cookie(`driverRefreshToken`, refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.OK)
                .json({ success: true, accessToken, user });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST).json({
                    success: false,
                    errors: error.issues
                });
                return;
            }
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            // 1. DTO Validation
            const { email, password, role } = ZodHelper_1.ZodHelper.validate(DriverRequestDTO_1.DriverLoginSchema, req.body);
            // 2. Execute
            const { accessToken, refreshToken } = await this.loginUsecase.execute(email, password, role);
            // 3. Set Cookie and Response
            const refreshTokenKey = `${role}RefreshToken`;
            res.cookie(refreshTokenKey, refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                accessToken,
                role,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST).json({
                    success: false,
                    errors: error.issues
                });
                return;
            }
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
            if (!driver) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.DRIVER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            // Return sanitized full profile for the driver's dashboard
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, driver: (0, DriverDTO_1.toDriverFullResponse)(driver) });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserById(req, res, next) {
        try {
            // 1. Param Validation
            const { id } = ZodHelper_1.ZodHelper.validate(DriverRequestDTO_1.UserIdParamSchema, req.params);
            // 2. Execute
            const user = await this.getUserDataUsecase.execute(id);
            if (!user) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            // 3. Response Mapping
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, user: (0, UserDTO_1.toUserResponse)(user) });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST).json({
                    success: false,
                    errors: error.issues
                });
                return;
            }
            next(error);
        }
    }
    async editDriverProfile(req, res, next) {
        try {
            // 1. DTO Validation
            const { id: driverId } = ZodHelper_1.ZodHelper.validate(DriverRequestDTO_1.UserIdParamSchema, req.params);
            const validatedData = ZodHelper_1.ZodHelper.validate(DriverRequestDTO_1.EditDriverProfileSchema, req.body);
            // 2. Execute
            // We remove _id from body if present to avoid type conflicts with params driverId
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id, ...updateData } = validatedData;
            const updatedDriver = await this.editDriverProfileUseCase.execute(driverId, updateData);
            if (!updatedDriver) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.DRIVER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, driver: (0, DriverDTO_1.toDriverFullResponse)(updatedDriver) });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST).json({
                    success: false,
                    errors: error.issues
                });
                return;
            }
            next(error);
        }
    }
    async onboardDriver(req, res, next) {
        try {
            // 1. DTO Validation
            const { email, driverId: bodyDriverId } = ZodHelper_1.ZodHelper.validate(DriverRequestDTO_1.OnboardDriverSchema, req.body);
            const driverId = bodyDriverId || req.user?.id;
            if (!driverId) {
                throw new Autherror_1.AuthError('driverId is required', HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            // 2. Execute
            const onboardingUrl = await this.onboardDriverUseCase.execute(email, driverId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ url: onboardingUrl });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST).json({
                    success: false,
                    errors: error.issues
                });
                return;
            }
            next(error);
        }
    }
    async getBookingsForDriver(req, res, next) {
        try {
            const driverId = req.user?.id;
            if (!driverId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.DRIVER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            // 1. Query Validation
            const { page, limit } = ZodHelper_1.ZodHelper.validate(DriverRequestDTO_1.DriverBookingPaginationSchema, req.query);
            // 2. Execute
            const paginatedBookings = await this.getUserBookingsUsecase.execute(driverId, page, limit);
            // 3. Response 
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                data: paginatedBookings.data,
                total: paginatedBookings.total,
                totalPages: paginatedBookings.totalPages,
                currentPage: paginatedBookings.page,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST).json({
                    success: false,
                    errors: error.issues
                });
                return;
            }
            next(error);
        }
    }
    async verifyAccount(req, res, next) {
        try {
            // 1. DTO Validation
            const { driverId } = ZodHelper_1.ZodHelper.validate(DriverRequestDTO_1.VerifyAccountSchema, req.body);
            // 2. Execute
            await this.verifyDriverPaymentAccount.execute(driverId);
            // 3. Response
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, message: 'Payment activated for driver' });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST).json({
                    success: false,
                    errors: error.issues
                });
                return;
            }
            next(error);
        }
    }
    async resendOTP(req, res, next) {
        try {
            // 1. DTO Validation
            const { email, role } = ZodHelper_1.ZodHelper.validate(DriverRequestDTO_1.ResendDriverOtpSchema, req.body);
            // 2. Execute
            const result = await this.resendOtpUsecase.execute(email, role);
            // 3. Response
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, message: result.message });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST).json({
                    success: false,
                    errors: error.issues
                });
                return;
            }
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