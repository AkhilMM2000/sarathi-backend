import { container, inject, injectable } from "tsyringe";

import { NextFunction, Request, Response } from "express";
import { AuthError } from "../../domain/errors/Autherror";
import { ForgotPasswordUseCase } from "../../application/use_cases/Auth/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../../application/use_cases/Auth/ResetPasswordUseCase";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { ChangePassword } from "../../application/use_cases/Auth/ChangePassword";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { IRefreshTokenUseCase } from "../../application/use_cases/Interfaces/IRefreshTokenUseCase";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
@injectable()
export class AuthController {

  constructor(
        @inject(USECASE_TOKENS.REFRESH_TOKEN_USECASE)
    private refreshTokenUseCase: IRefreshTokenUseCase,
  ){

  }
  async refreshToken(req: Request, res: Response,next:NextFunction) {


    try {
      const { role } = req.body;

      if (!role) {
        throw new AuthError(ERROR_MESSAGES.ROLE_REQUIRED,HTTP_STATUS_CODES.BAD_REQUEST);
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
        throw new AuthError(ERROR_MESSAGES.INVALID_ROLE, HTTP_STATUS_CODES.BAD_REQUEST);
      }

      const refreshToken = req.cookies[refreshTokenKey];

      
      if (!refreshToken) {
        throw new AuthError(ERROR_MESSAGES.REFRESHTOKEN_NOTFOUND, HTTP_STATUS_CODES.FORBIDDEN);
      }

     

      const result = await this.refreshTokenUseCase.execute(refreshToken, role);

      res.status(HTTP_STATUS_CODES.OK).json({ success: true, accessToken: result });
    } catch (error) {
     next(error) 
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
