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
            console.log(req.body);
            const user = await this.registerUsecase.execute(req.body);
            res
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.CREATED)
                .json({ success: true, message: Info_Messages_1.INFO_MESSAGES.USER.REGISTERED, user });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyOTPUser(req, res, next) {
        try {
            const { email, otp } = req.body;
            if (otp.length < 6) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.OTP_INVALID, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            console.log(req.body);
            const { accessToken, refreshToken, user } = await this.verifyOtpUsecase.execute(email, otp, "user");
            res.cookie(`userRefreshToken`, refreshToken, {
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
    async resendOTP(req, res, next) {
        try {
            const { email, role } = req.body;
            console.log(email, role);
            const result = await this.resendOtpUsecase.execute(email, role);
            res
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.OK)
                .json({ success: true, message: result.message });
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
    async addVehicle(req, res, next) {
        try {
            const vehicleData = req.body;
            const vehicle = await this.addVehicleUsecase.execute({
                ...vehicleData,
                userId: req.user?.id,
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, data: vehicle });
        }
        catch (error) {
            next(error);
        }
    }
    async editVehicle(req, res, next) {
        try {
            const { vehicleId } = req.params;
            const updateData = req.body;
            console.log(updateData);
            const updatedVehicle = await this.editVehicleUsecase.execute(vehicleId, updateData);
            res
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.OK)
                .json({ success: true, data: updatedVehicle });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllVehicle(req, res, next) {
        try {
            const userId = req.user?.id;
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
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, user });
        }
        catch (error) {
            next(error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const userId = req.params.id;
            const updateData = req.body;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            const updatedUser = await this.updateuserUsecase.execute(userId, updateData);
            res
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.OK)
                .json({ success: true, user: updatedUser });
        }
        catch (error) {
            next(error);
        }
    }
    async fetchDrivers(req, res, next) {
        try {
            const userId = req.user?.id;
            const { page = "1", limit = "10", search = "" } = req.query;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            // Execute the use case and fetch drivers
            const drivers = await this.findNearbyDrivers.execute(userId, Number(page), Number(limit), String(search));
            console.log(drivers, "got it ");
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, drivers });
        }
        catch (error) {
            next(error);
        }
    }
    async getDriverDetails(req, res, next) {
        try {
            const userId = '67e7b4415e9af0fdf18ad833';
            const { driverId } = req.params;
            console.log(driverId, 'got ');
            const driver = await this.getNearbyDriverDetailsUseCase.execute(userId, driverId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(driver);
        }
        catch (err) {
            next(err);
        }
    }
    async createPaymentIntent(req, res, next) {
        const { amount, driverId } = req.body;
        console.log(req.body);
        if (!amount || !driverId) {
            throw new Autherror_1.AuthError("missing amount or driverinfo", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
        }
        try {
            const result = await this.createPaymentUsecase.execute({
                amount,
                driverId,
            });
            res.json({
                clientSecret: result.clientSecret,
                paymentIntentId: result.paymentIntentId,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getDriverById(req, res, next) {
        try {
            const driverId = req.params.id;
            if (!driverId) {
                res
                    .status(400)
                    .json({ success: false, error: ErrorMessages_1.ERROR_MESSAGES.DRIVER_ID_NOT_FOUND });
                return;
            }
            const driver = await this.getDriverProfileUsecase.execute(driverId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, driver });
        }
        catch (error) {
            next(error);
        }
    }
    async WalletTransaction(req, res, next) {
        try {
            const { page, limit } = req.query;
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            const transactionHistory = await this.walletTransactionUsecase.getTransactionHistory(userId, Number(page), Number(limit));
            const ballence = await this.walletTransactionUsecase.getWalletBalance(userId);
            res
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.OK)
                .json({ success: true, transactionHistory, ballence });
        }
        catch (error) {
            next(error);
        }
    }
    async submitReview(req, res, next) {
        try {
            const { driverId, rideId, rating, review } = req.body;
            const userId = req.user?.id;
            if (!driverId || !rideId || !rating) {
                throw new Autherror_1.AuthError("All fields are required", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
            }
            const createdReview = await this.submitReviewUsecase.execute({
                driverId,
                userId,
                rideId,
                rating,
                review,
            });
            res
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.CREATED)
                .json({ message: "Review submitted", review: createdReview });
        }
        catch (error) {
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