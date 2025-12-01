import { container } from "tsyringe";
import { RefreshToken } from "../../application/use_cases/Refreshtoken";
import { Request, Response } from "express";
import { AuthError } from "../../domain/errors/Autherror";
import { ForgotPasswordUseCase } from "../../application/use_cases/Auth/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../../application/use_cases/Auth/ResetPasswordUseCase";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { ChangePassword } from "../../application/use_cases/Auth/ChangePassword";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";

export class AuthController {
  static async refreshToken(req: Request, res: Response) {
    try {
      const { role } = req.body;
console.log("Role from request body:", role);
      if (!role) {
        throw new AuthError("Role is required", 400);
      }

      const refreshTokenKey =
        role === "user"
          ? "userRefreshToken"
          : role === "driver"
          ? "driverRefreshToken"
          : role === "admin"
          ? "adminRefreshToken"
          : null;

      if (!refreshTokenKey) {
        throw new AuthError("Invalid role", 400);
      }

      const refreshToken = req.cookies[refreshTokenKey];
console.log(refreshTokenKey, ":", refreshToken);
      
      if (!refreshToken) {
        throw new AuthError("No refresh token found", 403);
      }

      const refreshTokenUseCase = container.resolve(RefreshToken);

      const result = await refreshTokenUseCase.execute(refreshToken, role);

      res.status(HTTP_STATUS_CODES.OK).json({ success: true, accessToken: result.accessToken });
    } catch (error) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: "Server error", error });
      return;
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email, role } = req.body;
      const forgotPassword = container.resolve(ForgotPasswordUseCase);
      const { message } = await forgotPassword.execute(email, role);
      res.status(200).json({ success: true, message });
    } catch (error) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: "Server error", error });
      return;
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword, role } = req.body;

      if (!token || !newPassword || !role) {
        res.status(400).json({ message: "Invalid input!" });
        return;
      }

      const resetPasswordUseCase = container.resolve(ResetPasswordUseCase);

      const result = await resetPasswordUseCase.execute(
        token,
        newPassword,
        role
      );

      res.status(200).json({
        success: true,
        message: result?.message,
      });
    } catch (error) {
      if (error instanceof AuthError) {
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

  static logout(req: Request, res: Response) {
    try {
      const role = req.query.role as "driver" | "user" | "admin";
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
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
      return;
    }
  }

  static async ChangePassword(req:AuthenticatedRequest, res: Response) {
    try {
      const { oldPassword, newPassword, role } = req.body;
      const userId = req.user?.id
      if (!userId) {
        throw new AuthError("Unauthorized: User ID is missing.", 401);
      }

     
      if (!oldPassword || !newPassword || !role) {
        throw new AuthError(
          "All fields (oldPassword, newPassword, role) are required.",
          400
        ); 
      }

      if (role !== "user" && role !== "driver") {
        throw new AuthError("Role must be 'user' or 'driver'.", 400);
      }

      const changePassword = container.resolve(ChangePassword);
     await changePassword.execute(
        userId,
        oldPassword,
        newPassword,
        role
      );
      res
        .status(200)
        .json({ message: "Password changed successfully." });
    } catch (error) {
      if (error instanceof AuthError) {
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
