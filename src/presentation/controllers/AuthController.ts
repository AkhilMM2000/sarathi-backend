import { container, inject, injectable } from "tsyringe";
import { NextFunction, Request, Response } from "express";
import { AuthError } from "../../domain/errors/Autherror";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { ChangePassword } from "../../application/use_cases/Auth/ChangePassword";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { IRefreshTokenUseCase } from "../../application/use_cases/Interfaces/IRefreshTokenUseCase";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { IForgotPasswordUseCase } from "../../application/use_cases/Auth/interface/IForgotPasswordUseCase";
import { IResetPasswordUseCase } from "../../application/use_cases/Auth/interface/IResetPasswordUseCase";
import { IChangePasswordUseCase } from "../../application/use_cases/Auth/interface/IChangePasswordUseCase";
@injectable()
export class AuthController {

  constructor(
        @inject(USECASE_TOKENS.REFRESH_TOKEN_USECASE)
    private refreshTokenUseCase: IRefreshTokenUseCase,
       @inject(USECASE_TOKENS.FORGOT_PASSWORD_USECASE)
    private forgotPasswordUseCase: IForgotPasswordUseCase,
        @inject(USECASE_TOKENS.RESET_PASSWORD_USECASE)
    private resetPasswordUseCase: IResetPasswordUseCase,
        @inject(USECASE_TOKENS.CHANGE_PASSWORD_USECASE)
    private changePasswordUseCase: IChangePasswordUseCase,
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

 async forgotPassword(req: Request, res: Response,next:NextFunction) {
    try {
      const { email, role } = req.body;
      
        await this.forgotPasswordUseCase.execute(email, role);
      res.status(HTTP_STATUS_CODES.OK).json({ success: true, message:`check ${role} mail for reset password`});
    } catch (error) {
     next(error)
    }
  }

   async resetPassword(req: Request, res: Response,next:NextFunction) {
    try {
      const { token, newPassword, role } = req.body;

      if (!token || !newPassword || !role) {
      
        throw new AuthError("Invalid input!",HTTP_STATUS_CODES.BAD_REQUEST)
      }

     

      const result = await this.resetPasswordUseCase.execute(
        token,
        newPassword,
        role
      );

      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        message:  `${role}Password reset successful`,
      });
    } catch (error) {
     
 next(error)
      
    }
  }

   logout(req: Request, res: Response,next:NextFunction) {
    try {
      const role = req.query.role as "driver" | "user" | "admin";
      console.log(role);

      if (!role) {
        res.status(400).json({ message: "Role is required" });
        throw new AuthError("Role is required" ,)
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
        .status(HTTP_STATUS_CODES.OK)
        .json({ success: true, message: `${role} is logout successfully` });
    } catch (error) {
       next(error)
    }
  }

  async ChangePassword(req:AuthenticatedRequest, res: Response,next:NextFunction) {
    try {
      const { oldPassword, newPassword, role } = req.body;
      const userId = req.user?.id
      if (!userId) {
        throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND, HTTP_STATUS_CODES.UNAUTHORIZED);
      }

     
      if (!oldPassword || !newPassword || !role) {
        throw new AuthError(
          "All fields (oldPassword, newPassword, role) are required.",
          HTTP_STATUS_CODES.BAD_REQUEST
        ); 
      }

      if (role !== "user" && role !== "driver") {
        throw new AuthError("Role must be 'user' or 'driver'.", HTTP_STATUS_CODES.NOT_FOUND);
      }

      const changePassword = container.resolve(ChangePassword);
     await changePassword.execute(
        userId,
        oldPassword,
        newPassword,
        role
      );
      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ message: "Password changed successfully." });
    } catch (error) {
     
   next(error)
    }
  }
}
