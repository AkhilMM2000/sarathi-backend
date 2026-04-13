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
exports.UserController = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../domain/errors/Autherror");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
const Tokens_1 = require("../../constants/Tokens");
const Info_Messages_1 = require("../../constants/Info_Messages");
const UseCaseTokens_1 = require("../../constants/UseCaseTokens");
const ZodHelper_1 = require("../dto/common/ZodHelper");
const UserDTO_1 = require("../dto/user/UserDTO");
const DriverDTO_1 = require("../dto/user/DriverDTO");
const zod_1 = require("zod");
let UserController = class UserController {
    constructor(registerUsecase, getUserDataUsecase, verifyOtpUsecase, resendOtpUsecase, loginUsecase, addVehicleUsecase, editVehicleUsecase, getVehiclebyUserUsecase, updateuserUsecase, findNearbyDrivers, createPaymentUsecase, getDriverProfileUsecase, walletTransactionUsecase, submitReviewUsecase, getNearbyDriverDetailsUseCase) {
        this.registerUsecase = registerUsecase;
        this.getUserDataUsecase = getUserDataUsecase;
        this.verifyOtpUsecase = verifyOtpUsecase;
        this.resendOtpUsecase = resendOtpUsecase;
        this.loginUsecase = loginUsecase;
        this.addVehicleUsecase = addVehicleUsecase;
        this.editVehicleUsecase = editVehicleUsecase;
        this.getVehiclebyUserUsecase = getVehiclebyUserUsecase;
        this.updateuserUsecase = updateuserUsecase;
        this.findNearbyDrivers = findNearbyDrivers;
        this.createPaymentUsecase = createPaymentUsecase;
        this.getDriverProfileUsecase = getDriverProfileUsecase;
        this.walletTransactionUsecase = walletTransactionUsecase;
        this.submitReviewUsecase = submitReviewUsecase;
        this.getNearbyDriverDetailsUseCase = getNearbyDriverDetailsUseCase;
    }
    async register(req, res, next) {
        try {
            // 1. DTO Validation
            const validatedData = ZodHelper_1.ZodHelper.validate(UserDTO_1.RegisterSchema, req.body);
            // 2. Execute Use Case (Unchanged signature)
            // Note: registerUsecase returns { message: string } during the OTP phase
            const result = await this.registerUsecase.execute(validatedData);
            // 3. Response Mapping
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.CREATED).json({
                success: true,
                message: Info_Messages_1.INFO_MESSAGES.USER.REGISTERED,
                user: result
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
    async verifyOTPUser(req, res, next) {
        try {
            // 1. DTO Validation
            const { email, otp } = ZodHelper_1.ZodHelper.validate(UserDTO_1.VerifyOtpSchema, req.body);
            // 2. Execute Use Case
            const { accessToken, refreshToken, user } = await this.verifyOtpUsecase.execute(email, otp, "user");
            // 3. Set Cookie and Response
            res.cookie(`userRefreshToken`, refreshToken, {
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
    async resendOTP(req, res, next) {
        try {
            // 1. DTO Validation
            const { email, role } = ZodHelper_1.ZodHelper.validate(UserDTO_1.ResendOtpSchema, req.body);
            // 2. Execute Use Case
            const result = await this.resendOtpUsecase.execute(email, role);
            // 3. Response
            res
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.OK)
                .json({ success: true, message: result.message });
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
            const { email, password, role } = ZodHelper_1.ZodHelper.validate(UserDTO_1.LoginSchema, req.body);
            // 2. Execute Use Case
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
    async addVehicle(req, res, next) {
        try {
            // 1. DTO Validation
            const validatedData = ZodHelper_1.ZodHelper.validate(UserDTO_1.AddVehicleSchema, req.body);
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            // 2. Execute Use Case
            const vehicle = await this.addVehicleUsecase.execute({
                ...validatedData,
                userId: userId,
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, data: vehicle });
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
    async editVehicle(req, res, next) {
        try {
            // 1. DTO Validation
            const { vehicleId } = ZodHelper_1.ZodHelper.validate(UserDTO_1.VehicleIdParamSchema, req.params);
            const validatedData = ZodHelper_1.ZodHelper.validate(UserDTO_1.EditVehicleSchema, req.body);
            // 2. Execute Use Case
            const updatedVehicle = await this.editVehicleUsecase.execute(vehicleId, validatedData);
            res
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.OK)
                .json({ success: true, data: updatedVehicle });
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
    async getAllVehicle(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            const vehicles = await this.getVehiclebyUserUsecase.execute(userId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, data: vehicles });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserData(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            const user = await this.getUserDataUsecase.execute(userId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, user: (0, UserDTO_1.toUserResponse)(user) });
        }
        catch (error) {
            next(error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const userId = req.params.id;
            // 1. DTO Validation
            const validatedData = ZodHelper_1.ZodHelper.validate(UserDTO_1.UpdateUserSchema, req.body);
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            // 2. Execute Use Case with sanitized data
            const updatedUser = await this.updateuserUsecase.execute(userId, validatedData);
            // 3. Response Mapping
            if (!updatedUser) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                success: true,
                message: "User Profile Updated Sucessfully",
                user: (0, UserDTO_1.toUserResponse)(updatedUser),
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
    async fetchDrivers(req, res, next) {
        try {
            // 1. Authenticated User Check
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            // 2. Query Validation (Automatic page/limit numeric coercion)
            const { page, limit, search, lat, lng } = ZodHelper_1.ZodHelper.validate(UserDTO_1.FetchDriversSchema, req.query);
            // 3. Execute the use case
            const paginatedDrivers = await this.findNearbyDrivers.execute(userId, page, limit, search, lat, lng);
            // 4. Map to safe Response DTOs
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                success: true,
                drivers: {
                    ...paginatedDrivers,
                    data: (0, DriverDTO_1.toDriverListResponse)(paginatedDrivers.data)
                }
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
    async getDriverDetails(req, res, next) {
        try {
            // 1. Param Validation
            const { driverId } = ZodHelper_1.ZodHelper.validate(UserDTO_1.DriverIdParamSchema, req.params);
            console.log(req.query, 'query');
            // 2. Query Validation (Optional coordinates)
            const { lat, lng } = ZodHelper_1.ZodHelper.validate(UserDTO_1.GetNearbyDriverQuerySchema, req.query);
            const userId = req.user?.id;
            // 3. Execute and map to safe Response DTO
            const driver = await this.getNearbyDriverDetailsUseCase.execute(userId, driverId, lat, lng);
            console.log(driver, userId, driverId, lat, lng, 'driver');
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json((0, DriverDTO_1.toDriverResponse)(driver));
        }
        catch (error) {
            console.log(error, 'error');
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
    async createPaymentIntent(req, res, next) {
        try {
            // 1. DTO Validation
            const { amount, driverId } = ZodHelper_1.ZodHelper.validate(UserDTO_1.CreatePaymentIntentSchema, req.body);
            // 2. Execute Use Case
            const result = await this.createPaymentUsecase.execute({
                amount,
                driverId,
            });
            // 3. Response 
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                clientSecret: result.clientSecret,
                paymentIntentId: result.paymentIntentId,
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
    async getDriverById(req, res, next) {
        try {
            // 1. Param Validation
            const { driverId } = ZodHelper_1.ZodHelper.validate(UserDTO_1.DriverIdParamSchema, {
                driverId: req.params.id,
            });
            // 2. Execute
            const driver = await this.getDriverProfileUsecase.execute(driverId);
            console.log(driver, 'driver');
            if (!driver) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.DRIVER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            // 3. Response Mapping
            res
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.OK)
                .json({ success: true, driver: (0, DriverDTO_1.toDriverResponse)(driver) });
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
    async WalletTransaction(req, res, next) {
        try {
            // 1. DTO Validation (Automatic numeric coercion)
            const { page, limit } = ZodHelper_1.ZodHelper.validate(UserDTO_1.WalletPaginationSchema, req.query);
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            // 2. Execute
            const transactionHistory = await this.walletTransactionUsecase.getTransactionHistory(userId, page, limit);
            const ballence = await this.walletTransactionUsecase.getWalletBalance(userId);
            // 3. Response
            res
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.OK)
                .json({ success: true, transactionHistory, ballence });
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
    async submitReview(req, res, next) {
        try {
            // 1. DTO Validation
            const { driverId, rideId, rating, review } = ZodHelper_1.ZodHelper.validate(UserDTO_1.SubmitReviewSchema, req.body);
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
            }
            // 2. Execute
            const createdReview = await this.submitReviewUsecase.execute({
                driverId,
                userId,
                rideId,
                rating,
                review,
            });
            // 3. Response
            res
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.CREATED)
                .json({ message: "Review submitted", review: createdReview });
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
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.REGISTER_USER_USECASE)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.GET_USER_DATA_USECASE)),
    __param(2, (0, tsyringe_1.inject)(Tokens_1.TOKENS.VERIFY_OTP_USECAE)),
    __param(3, (0, tsyringe_1.inject)(Tokens_1.TOKENS.RESEND_OTP_USECASE)),
    __param(4, (0, tsyringe_1.inject)(Tokens_1.TOKENS.LOGIN_USECASE)),
    __param(5, (0, tsyringe_1.inject)(Tokens_1.TOKENS.ADD_VEHICLE_USECASE)),
    __param(6, (0, tsyringe_1.inject)(Tokens_1.TOKENS.EDIT_VEHICLE_USECASE)),
    __param(7, (0, tsyringe_1.inject)(Tokens_1.TOKENS.GET_VEHICLES_BY_USER_USECASE)),
    __param(8, (0, tsyringe_1.inject)(Tokens_1.TOKENS.UPDATE_USER_USECASE)),
    __param(9, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.FIND_NEARBY_DRIVERS_USECASE)),
    __param(10, (0, tsyringe_1.inject)(Tokens_1.TOKENS.CREATE_PAYMENT_INTENT_USECASE)),
    __param(11, (0, tsyringe_1.inject)(Tokens_1.TOKENS.GET_DRIVER_PROFILE_USECASE)),
    __param(12, (0, tsyringe_1.inject)(Tokens_1.TOKENS.WALLET_TRANSACTION_USECASE)),
    __param(13, (0, tsyringe_1.inject)(Tokens_1.TOKENS.SUBMIT_REVIEW_USECASE)),
    __param(14, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GET_NEARBY_DRIVER_DETAILS_USECASE)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], UserController);
//# sourceMappingURL=UserController.js.map