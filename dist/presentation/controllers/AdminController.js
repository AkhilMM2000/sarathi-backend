"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../domain/errors/Autherror");
const Login_1 = require("../../application/use_cases/Login");
const GetAllusers_1 = require("../../application/use_cases/Admin/GetAllusers");
const BlockUser_1 = require("../../application/use_cases/Admin/BlockUser");
const GetDrivers_1 = require("../../application/use_cases/Admin/GetDrivers");
const AdminChangeDriverStatus_1 = require("../../application/use_cases/Admin/AdminChangeDriverStatus");
const BlockOrUnblockDriver_1 = require("../../application/use_cases/Admin/BlockOrUnblockDriver");
const GetVehiclesByUser_1 = require("../../application/use_cases/Admin/GetVehiclesByUser");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
class AdminController {
    static async login(req, res) {
        try {
            const login = tsyringe_1.container.resolve(Login_1.Login);
            const { email, password, role } = req.body;
            console.log(req.body);
            const { accessToken, refreshToken } = await login.execute(email, password, req.body.role);
            const refreshTokenKey = `${role}RefreshToken`;
            res.cookie(refreshTokenKey, refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({
                accessToken,
                role,
                message: "your admin login successfull"
            });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
            res.status(500).json({ success: false, error: "Something went wrong" });
            return;
        }
    }
    static async getAllUsers(req, res) {
        try {
            const getAllUsers = tsyringe_1.container.resolve(GetAllusers_1.GetAllUsers);
            const usersWithVehicleCount = await getAllUsers.execute();
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                success: true,
                data: usersWithVehicleCount,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: "Failed to fetch users",
            });
        }
    }
    static async updateUserStatus(req, res) {
        try {
            const { userId } = req.params;
            const { isBlock } = req.body;
            const blockUserUseCase = tsyringe_1.container.resolve(BlockUser_1.BlockUserUseCase);
            const blockedUser = await blockUserUseCase.execute(userId, isBlock);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                success: true,
                message: isBlock
                    ? "User blocked successfully"
                    : "User unblocked successfully",
                user: blockedUser,
            });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error: "Something went wrong" });
            return;
        }
    }
    static async getAllDrivers(req, res) {
        try {
            const getAllUsersUseCase = tsyringe_1.container.resolve(GetDrivers_1.GetDrivers);
            const drivers = await getAllUsersUseCase.execute();
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(drivers);
        }
        catch (error) {
            console.error("Error fetching drivers:", error);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch drivers", error });
        }
    }
    static async changeDriverStatus(req, res) {
        try {
            const { driverId } = req.params;
            const { status, reason } = req.body;
            const adminChangeDriverStatus = tsyringe_1.container.resolve(AdminChangeDriverStatus_1.AdminChangeDriverStatus);
            // Execute the use case
            const updatedDriver = await adminChangeDriverStatus.execute(driverId, status, reason);
            if (!updatedDriver) {
                res.status(404).json({ message: "Driver not found" });
                return;
            }
            res.status(200).json({
                message: "Driver status updated successfully",
                driver: updatedDriver
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async handleBlockStatus(req, res) {
        try {
            const { driverId } = req.params;
            const { isBlock } = req.body;
            // Validate input
            if (typeof isBlock !== "boolean") {
                res.status(400).json({ message: "Invalid isBlocked value. Must be a boolean." });
                return;
            }
            // Get use case from DI container
            const blockOrUnblockDriver = tsyringe_1.container.resolve(BlockOrUnblockDriver_1.BlockOrUnblockDriver);
            // Execute the use case
            await blockOrUnblockDriver.execute(driverId, isBlock);
            res.status(200).json({ success: true, message: `Driver ${isBlock ? "blocked" : "unblocked"} successfully` });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
            res.status(500).json({ success: false, error: "Something went wrong" });
            return;
        }
    }
    static async getVehiclesByUser(req, res) {
        try {
            const { userId } = req.params;
            const getVehiclesByUser = tsyringe_1.container.resolve(GetVehiclesByUser_1.GetVehiclesByUser);
            const vehicles = await getVehiclesByUser.execute(userId);
            res.status(200).json({ success: true, data: vehicles });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
            res.status(500).json({ success: false, error: "Something went wrong" });
            return;
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=AdminController.js.map