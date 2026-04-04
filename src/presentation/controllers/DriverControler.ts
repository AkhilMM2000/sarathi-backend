import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { AuthError } from "../../domain/errors/Autherror";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { PaginatedResult, rideHistory } from "../../domain/repositories/IBookingrepository";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { IRegisterDriverUseCase } from "../../application/use_cases/Driver/interfaces/IRegisterDriverUseCase";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { IVerifyOtp } from "../../application/use_cases/Interfaces/IVerifyOtp";
import { IResendOTP } from "../../application/use_cases/Interfaces/IResendOTP";
import { TOKENS } from "../../constants/Tokens";
import { ILogin } from "../../application/use_cases/Interfaces/ILogin";
import { IGetDriverProfile } from "../../application/use_cases/Driver/interfaces/IGetDriverProfile";
import { IGetUserData } from "../../application/use_cases/User/interfaces/IGetUserData";
import { IEditDriverProfile } from "../../application/use_cases/Driver/interfaces/IEditDriverProfile";
import { IOnboardDriverUseCase } from "../../application/use_cases/Driver/interfaces/IOnboardDriverUseCase";
import { IGetBooking } from "../../application/use_cases/Driver/interfaces/IGetUserBooking";
import { IVerifyDriverPaymentAccount } from "../../application/use_cases/Driver/interfaces/IVerifyDriverPaymentAccount";
import { ZodHelper } from "../dto/common/ZodHelper";
import { RegisterDriverSchema, VerifyDriverOtpSchema, DriverLoginSchema, ResendDriverOtpSchema, EditDriverProfileSchema, OnboardDriverSchema, UserIdParamSchema, DriverBookingPaginationSchema, VerifyAccountSchema } from "../dto/driver/DriverRequestDTO";
import { toDriverResponse } from "../dto/user/DriverDTO";
import { toUserResponse, DriverIdParamSchema } from "../dto/user/UserDTO";
import { z } from "zod";
@injectable()
export class DriverController {

 constructor(
    @inject(USECASE_TOKENS.REGISTER_DRIVER_USECASE)
    private registerDriverUseCase: IRegisterDriverUseCase,
    @inject(TOKENS.VERIFY_OTP_USECAE)
    private verifyOtpUsecase: IVerifyOtp,
    @inject(TOKENS.LOGIN_USECASE)
    private loginUsecase: ILogin,
    @inject(TOKENS.GET_DRIVER_PROFILE_USECASE)
    private getDriverProfileUsecase: IGetDriverProfile,
    @inject(TOKENS.GET_USER_DATA_USECASE)
    private getUserDataUsecase: IGetUserData,
    @inject(TOKENS.RESEND_OTP_USECASE)
    private resendOtpUsecase: IResendOTP,
     @inject(USECASE_TOKENS.EDIT_DRIVER_PROFILE)
    private editDriverProfileUseCase: IEditDriverProfile,
      @inject(USECASE_TOKENS.ONBOARD_DRIVER_USECASE)
    private onboardDriverUseCase: IOnboardDriverUseCase,
    @inject(USECASE_TOKENS.GET_USERBOOKINGS_USECASE)
    private getUserBookingsUsecase:IGetBooking,
    @inject(USECASE_TOKENS.VERIFY_DRIVER_PAYMENT_ACCOUNT_USECASE)
private verifyDriverPaymentAccount: IVerifyDriverPaymentAccount
  ) {}

   async registerDriver(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. DTO Validation
      const validatedData = ZodHelper.validate(RegisterDriverSchema, req.body);

      // 2. Execute
      const response = await this.registerDriverUseCase.execute(validatedData as any);
      
      // 3. Response
      res.status(HTTP_STATUS_CODES.OK).json({ success: true, ...response });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          errors: error.issues
        });
        return;
      }
      next(error);
    }
  }
   async verifyOTPDriver(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. DTO Validation
      const { email, otp } = ZodHelper.validate(VerifyDriverOtpSchema, req.body);

      // 2. Execute
      const { accessToken, refreshToken, user } =
        await this.verifyOtpUsecase.execute(email, otp, "driver");
      
      // 3. Set Cookie and Response
      res.cookie(`driverRefreshToken`, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ success: true, accessToken, user });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          errors: error.issues
        });
        return;
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. DTO Validation
      const { email, password, role } = ZodHelper.validate(DriverLoginSchema, req.body);

      // 2. Execute
      const { accessToken, refreshToken } = await this.loginUsecase.execute(
        email,
        password,
        role
      );

      // 3. Set Cookie and Response
      const refreshTokenKey = `${role}RefreshToken`;

      res.cookie(refreshTokenKey, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(HTTP_STATUS_CODES.OK).json({
        accessToken,
        role,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          errors: error.issues
        });
        return;
      }
      next(error);
    }
  }
   async getDriverProfile(req:AuthenticatedRequest, res: Response,next:NextFunction): Promise<void> {
    try {
      const driverId = req.user?.id
      if (!driverId) {
       throw new AuthError(ERROR_MESSAGES.DRIVER_ID_NOT_FOUND,HTTP_STATUS_CODES.BAD_REQUEST)
    }
      const driver = await this.getDriverProfileUsecase.execute(driverId);

      // Return sanitized profile
      res.status(HTTP_STATUS_CODES.OK).json({ success: true, driver: toDriverResponse(driver as any) });
    } catch (error) {
      next(error)
    }
  }

 async getUserById(req: AuthenticatedRequest, res: Response,next:NextFunction): Promise<void> {
    try {
      // 1. Param Validation
      const { id } = ZodHelper.validate(UserIdParamSchema, req.params); 

      // 2. Execute
      const user = await this.getUserDataUsecase.execute(id);
      
      // 3. Response Mapping
      res.status(HTTP_STATUS_CODES.OK).json({ success: true, user: toUserResponse(user as any) });
    } catch (error: any) {
       if (error instanceof z.ZodError) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          errors: error.issues
        });
        return;
      }
       next(error)
    }
  }

  async editDriverProfile(req:AuthenticatedRequest, res: Response,next:NextFunction): Promise<void> {
    try {
      // 1. DTO Validation
      const { driverId } = ZodHelper.validate(DriverIdParamSchema, req.params);
      const validatedData = ZodHelper.validate(EditDriverProfileSchema, req.body);
 
      // 2. Execute
      const updatedDriver = await this.editDriverProfileUseCase.execute(
        driverId,
        validatedData
      );
        
      res.status(HTTP_STATUS_CODES.OK).json({success: true, driver: toDriverResponse(updatedDriver as any) });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          errors: error.issues
        });
        return;
      }
      next(error)
    }
  }
  
  async onboardDriver(req: AuthenticatedRequest, res: Response,next:NextFunction): Promise<void> {
    try {
      // 1. DTO Validation
      const { email, driverId: bodyDriverId } = ZodHelper.validate(OnboardDriverSchema, req.body);
      
      const driverId = bodyDriverId || req.user?.id;
      
      if (!driverId) {
        throw new AuthError( 'driverId is required',HTTP_STATUS_CODES.BAD_REQUEST
        )
      }

      // 2. Execute
      const onboardingUrl = await this.onboardDriverUseCase.execute(email, driverId);

      res.status(HTTP_STATUS_CODES.OK).json({ url: onboardingUrl });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          errors: error.issues
        });
        return;
      }
      next(error)
    }
  }
  async getBookingsForDriver(req: AuthenticatedRequest, res: Response,next:NextFunction): Promise<void>{
    try {
      const driverId=req.user?.id;
      if(!driverId){
        throw new AuthError(ERROR_MESSAGES.DRIVER_ID_NOT_FOUND,HTTP_STATUS_CODES.BAD_REQUEST)
      }

      // 1. Query Validation
      const { page, limit } = ZodHelper.validate(DriverBookingPaginationSchema, req.query);

      // 2. Execute
      const paginatedBookings: PaginatedResult<rideHistory> =
        await this.getUserBookingsUsecase.execute(driverId, page, limit);

      // 3. Response 
      res.status(HTTP_STATUS_CODES.OK).json({
        data: paginatedBookings.data,
        total: paginatedBookings.total,
        totalPages: paginatedBookings.totalPages,
        currentPage: paginatedBookings.page,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          errors: error.issues
        });
        return;
      }
      next(error)
    }
  }

async verifyAccount(req: Request, res: Response,next:NextFunction): Promise<void> {
    try {
      // 1. DTO Validation
      const { driverId } = ZodHelper.validate(VerifyAccountSchema, req.body);
    
      // 2. Execute
      await this.verifyDriverPaymentAccount.execute(driverId);

      // 3. Response
      res.status(HTTP_STATUS_CODES.OK).json({ success: true, message: 'Payment activated for driver' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          errors: error.issues
        });
        return;
      }
     next(error)
     
    }
  }

  async resendOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. DTO Validation
      const { email, role } = ZodHelper.validate(ResendDriverOtpSchema, req.body);

      // 2. Execute
      const result = await this.resendOtpUsecase.execute(email, role);

      // 3. Response
      res.status(HTTP_STATUS_CODES.OK).json({ success: true, message: result.message });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          errors: error.issues
        });
        return;
      }
      next(error);
    }
  }
  
}
