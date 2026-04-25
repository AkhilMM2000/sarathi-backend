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
exports.AdminController = void 0;
const tsyringe_1 = require("tsyringe");
const ZodHelper_1 = require("../schemas/common/ZodHelper");
const Autherror_1 = require("../../domain/errors/Autherror");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
const Tokens_1 = require("../../constants/Tokens");
const UseCaseTokens_1 = require("../../constants/UseCaseTokens");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
const AdminRequestDTO_1 = require("../schemas/admin/AdminRequestDTO");
let AdminController = class AdminController {
    constructor(loginUsecase, getAllUsersUseCase, blockUserUseCase, getDriversUseCase, changeDriverStatusUseCase, blockOrUnblockDriverUseCase, getVehiclebyUserUsecase, getAdminDashboardStatsUseCase) {
        this.loginUsecase = loginUsecase;
        this.getAllUsersUseCase = getAllUsersUseCase;
        this.blockUserUseCase = blockUserUseCase;
        this.getDriversUseCase = getDriversUseCase;
        this.changeDriverStatusUseCase = changeDriverStatusUseCase;
        this.blockOrUnblockDriverUseCase = blockOrUnblockDriverUseCase;
        this.getVehiclebyUserUsecase = getVehiclebyUserUsecase;
        this.getAdminDashboardStatsUseCase = getAdminDashboardStatsUseCase;
    }
    async login(req, res, next) {
        try {
            // 1. DTO Validation
            const { email, password, role } = ZodHelper_1.ZodHelper.validate(AdminRequestDTO_1.AdminLoginSchema, req.body);
            // 2. Execute
            const { accessToken, refreshToken } = await this.loginUsecase.execute(email, password, role);
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
                message: "your admin login successfull",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllUsers(req, res, next) {
        try {
            // 1. Request Validation (Optional pagination params)
            const { page, limit } = ZodHelper_1.ZodHelper.validate(AdminRequestDTO_1.AdminPaginationSchema, req.query);
            // 2. Execute
            const usersWithVehicleCount = await this.getAllUsersUseCase.execute();
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                success: true,
                data: usersWithVehicleCount,
                pagination: { page, limit }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateUserStatus(req, res, next) {
        try {
            // 1. Param & Body Validation
            const { userId } = ZodHelper_1.ZodHelper.validate(AdminRequestDTO_1.UserIdParamSchema, req.params);
            const { isBlock } = ZodHelper_1.ZodHelper.validate(AdminRequestDTO_1.UpdateUserStatusSchema, req.body);
            // 2. Execute
            const blockedUser = await this.blockUserUseCase.execute(userId, isBlock);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                success: true,
                message: isBlock
                    ? "User blocked successfully"
                    : "User unblocked successfully",
                user: blockedUser,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllDrivers(req, res, next) {
        try {
            // 1. Request Validation (pagination params)
            const { page, limit } = ZodHelper_1.ZodHelper.validate(AdminRequestDTO_1.AdminPaginationSchema, req.query);
            // 2. Execute
            const paginatedDrivers = await this.getDriversUseCase.execute(page, limit);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                success: true,
                ...paginatedDrivers
            });
        }
        catch (error) {
            next(error);
        }
    }
    async changeDriverStatus(req, res, next) {
        try {
            // 1. Param & Body Validation
            const { driverId } = ZodHelper_1.ZodHelper.validate(AdminRequestDTO_1.DriverIdParamSchema, req.params);
            const { status, reason } = ZodHelper_1.ZodHelper.validate(AdminRequestDTO_1.ChangeDriverStatusSchema, req.body);
            // 2. Execute the use case
            const updatedDriver = await this.changeDriverStatusUseCase.execute(driverId, status, reason);
            if (!updatedDriver) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.DRIVER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                message: "Driver status updated successfully",
                driver: updatedDriver
            });
        }
        catch (error) {
            next(error);
        }
    }
    async handleBlockStatus(req, res, next) {
        try {
            // 1. Param & Body Validation
            const { driverId } = ZodHelper_1.ZodHelper.validate(AdminRequestDTO_1.DriverIdParamSchema, req.params);
            const { isBlock } = ZodHelper_1.ZodHelper.validate(AdminRequestDTO_1.HandleBlockStatusSchema, req.body);
            // 2. Execute the use case
            await this.blockOrUnblockDriverUseCase.execute(driverId, isBlock);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, message: `Driver ${isBlock ? "blocked" : "unblocked"} successfully` });
        }
        catch (error) {
            next(error);
        }
    }
    async getVehiclesByUser(req, res, next) {
        try {
            // 1. Param Validation
            const { userId } = ZodHelper_1.ZodHelper.validate(AdminRequestDTO_1.UserIdParamSchema, req.params);
            // 2. Execute
            const vehicles = await this.getVehiclebyUserUsecase.execute(userId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, data: vehicles });
        }
        catch (error) {
            next(error);
        }
    }
    async getDashboardStats(req, res, next) {
        try {
            const stats = await this.getAdminDashboardStatsUseCase.execute();
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.AdminController = AdminController;
exports.AdminController = AdminController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.LOGIN_USECASE)),
    __param(1, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GET_ALL_USERS_USECASE)),
    __param(2, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.BLOCK_USER_USECASE)),
    __param(3, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GET_DRIVERS_USECASE)),
    __param(4, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.ADMIN_CHANGE_DRIVER_STATUS_USECASE)),
    __param(5, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.BLOCK_OR_UNBLOCK_DRIVER_USECASE)),
    __param(6, (0, tsyringe_1.inject)(Tokens_1.TOKENS.GET_VEHICLES_BY_USER_USECASE)),
    __param(7, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GET_ADMIN_DASHBOARD_STATS_USECASE)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], AdminController);
//# sourceMappingURL=AdminController.js.map