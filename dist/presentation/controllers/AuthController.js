"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tsyringe_1 = require("tsyringe");
const Refreshtoken_1 = require("../../application/use_cases/Refreshtoken");
const Autherror_1 = require("../../domain/errors/Autherror");
const ForgotPasswordUseCase_1 = require("../../application/use_cases/Auth/ForgotPasswordUseCase");
const ResetPasswordUseCase_1 = require("../../application/use_cases/Auth/ResetPasswordUseCase");
const ChangePassword_1 = require("../../application/use_cases/Auth/ChangePassword");
class AuthController {
    static async refreshToken(req, res) {
        try {
            const { role } = req.body;
            if (!role) {
                throw new Autherror_1.AuthError("Role is required", 400);
            }
            const refreshTokenKey = role === "user"
                ? "userRefreshToken"
                : role === "driver"
                    ? "driverRefreshToken"
                    : role === "admin"
                        ? "adminRefreshToken"
                        : null;
            if (!refreshTokenKey) {
                throw new Autherror_1.AuthError("Invalid role", 400);
            }
            const refreshToken = req.cookies[refreshTokenKey];
            if (!refreshToken) {
                throw new Autherror_1.AuthError("No refresh token found", 403);
            }
            const refreshTokenUseCase = tsyringe_1.container.resolve(Refreshtoken_1.RefreshToken);
            const result = await refreshTokenUseCase.execute(refreshToken, role);
            res.status(200).json({ success: true, accessToken: result.accessToken });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: "Server error", error });
            return;
        }
    }
    static async forgotPassword(req, res) {
        try {
            const { email, role } = req.body;
            const forgotPassword = tsyringe_1.container.resolve(ForgotPasswordUseCase_1.ForgotPasswordUseCase);
            const { message } = await forgotPassword.execute(email, role);
            res.status(200).json({ success: true, message });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: "Server error", error });
            return;
        }
    }
    static async resetPassword(req, res) {
        try {
            const { token, newPassword, role } = req.body;
            if (!token || !newPassword || !role) {
                res.status(400).json({ message: "Invalid input!" });
                return;
            }
            const resetPasswordUseCase = tsyringe_1.container.resolve(ResetPasswordUseCase_1.ResetPasswordUseCase);
            const result = await resetPasswordUseCase.execute(token, newPassword, role);
            res.status(200).json({
                success: true,
                message: result?.message,
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
            console.error("Error resetting password:", error);
            res.status(500).json({
                success: false,
                error: "Something went wrong!",
            });
        }
    }
    static logout(req, res) {
        try {
            const role = req.query.role;
            console.log(role);
            if (!role) {
                res.status(400).json({ message: "Role is required" });
                return;
            }
            const token = req.cookies[`${role}RefreshToken`];
            console.log(`${role} Refresh Token before clearing:`, token);
            // 🔹 ust clearing the refresh token cookie
            res.clearCookie(`${role}RefreshToken`, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
            });
            res
                .status(200)
                .json({ success: true, message: `${role} is logout successfully` });
        }
        catch (error) {
            res.status(500).json({ message: "Logout failed" });
            return;
        }
    }
    static async ChangePassword(req, res) {
        try {
            const { oldPassword, newPassword, role } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError("Unauthorized: User ID is missing.", 401);
            }
            if (!oldPassword || !newPassword || !role) {
                throw new Autherror_1.AuthError("All fields (oldPassword, newPassword, role) are required.", 400);
            }
            if (role !== "user" && role !== "driver") {
                throw new Autherror_1.AuthError("Role must be 'user' or 'driver'.", 400);
            }
            const changePassword = tsyringe_1.container.resolve(ChangePassword_1.ChangePassword);
            await changePassword.execute(userId, oldPassword, newPassword, role);
            res
                .status(200)
                .json({ message: "Password changed successfully." });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
            console.error("Error resetting password:", error);
            res.status(500).json({
                success: false,
                error: "Something went wrong!",
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map