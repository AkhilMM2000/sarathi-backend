import { inject, injectable } from "tsyringe";
import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { IRefreshTokenUseCase } from "../../application/use_cases/Interfaces/IRefreshTokenUseCase";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { IForgotPasswordUseCase } from "../../application/use_cases/Auth/interface/IForgotPasswordUseCase";
import { IResetPasswordUseCase } from "../../application/use_cases/Auth/interface/IResetPasswordUseCase";
import { IChangePasswordUseCase } from "../../application/use_cases/Auth/interface/IChangePasswordUseCase";
import { ZodHelper } from "../dto/common/ZodHelper";
import { RefreshTokenSchema, ForgotPasswordSchema, ResetPasswordSchema, LogoutSchema, ChangePasswordSchema } from "../dto/auth/AuthRequestDTO";
import { AuthError } from "../../domain/errors/Autherror";

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
    private changePasswordUseCase: IChangePasswordUseCase
  ) {}

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. DTO Validation
      const { role } = ZodHelper.validate(RefreshTokenSchema, req.body);

      const refreshTokenKey = `${role}RefreshToken`;
      const refreshToken = req.cookies[refreshTokenKey];

      if (!refreshToken) {
        throw new AuthError(ERROR_MESSAGES.REFRESHTOKEN_NOTFOUND, HTTP_STATUS_CODES.FORBIDDEN);
      }

      // 2. Execute
      const result = await this.refreshTokenUseCase.execute(refreshToken, role);

      res.status(HTTP_STATUS_CODES.OK).json({ success: true, accessToken: result });
    } catch (error) {
      next(error);
    }
  }

  
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. DTO Validation
      const { email, role } = ZodHelper.validate(ForgotPasswordSchema, req.body);

      // 2. Execute
      await this.forgotPasswordUseCase.execute(email, role);
      res.status(HTTP_STATUS_CODES.OK).json({ 
        success: true, 
        message: `check ${role} mail for reset password` 
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. DTO Validation
      const { token, newPassword, role } = ZodHelper.validate(ResetPasswordSchema, req.body);

      // 2. Execute
      await this.resetPasswordUseCase.execute(token, newPassword, role);

      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        message: `${role} Password reset successful`,
      });
    } catch (error) {
      next(error);
    }
  }

  logout(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. DTO Validation (Query params)
      const { role } = ZodHelper.validate(LogoutSchema, req.query);

      // 2. Clear Cookie
      res.clearCookie(`${role}RefreshToken`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      res.status(HTTP_STATUS_CODES.OK).json({ 
        success: true, 
        message: `${role} logout successful` 
      });
    } catch (error) {
      next(error);
    }
  }

  async ChangePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND, HTTP_STATUS_CODES.UNAUTHORIZED);
      }

      // 1. DTO Validation
      const { oldPassword, newPassword, role } = ZodHelper.validate(ChangePasswordSchema, req.body);

      // 2. Execute
      await this.changePasswordUseCase.execute(userId, oldPassword, newPassword, role);

      res.status(HTTP_STATUS_CODES.OK).json({ 
        success: true,
        message: "Password changed successfully." 
      });
    } catch (error) {
      next(error);
    }
  }
}
