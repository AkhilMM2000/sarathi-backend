import { NextFunction, Request, Response } from "express";
import {  inject, injectable } from "tsyringe";
import { AuthError } from "../../domain/errors/Autherror";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";

import { PaginatedResult, rideHistory } from "../../domain/repositories/IBookingrepository";

import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { IRegisterDriverUseCase } from "../../application/use_cases/Driver/interfaces/IRegisterDriverUseCase";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { IVerifyOtp } from "../../application/use_cases/Interfaces/IVerifyOtp";
import { TOKENS } from "../../constants/Tokens";
import { ILogin } from "../../application/use_cases/Interfaces/ILogin";
import { IGetDriverProfile } from "../../application/use_cases/Driver/interfaces/IGetDriverProfile";
import { IGetUserData } from "../../application/use_cases/User/interfaces/IGetUserData";
import { IEditDriverProfile } from "../../application/use_cases/Driver/interfaces/IEditDriverProfile";
import { IOnboardDriverUseCase } from "../../application/use_cases/Driver/interfaces/IOnboardDriverUseCase";
import { IGetBooking } from "../../application/use_cases/Driver/interfaces/IGetUserBooking";
import { IVerifyDriverPaymentAccount } from "../../application/use_cases/Driver/interfaces/IVerifyDriverPaymentAccount";
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
     @inject(USECASE_TOKENS.EDIT_DRIVER_PROFILE)
    private editDriverProfileUseCase: IEditDriverProfile,
      @inject(USECASE_TOKENS.ONBOARD_DRIVER_USECASE)
    private onboardDriverUseCase: IOnboardDriverUseCase,
    @inject(USECASE_TOKENS.GET_USERBOOKINGS_USECASE)
    private getUserBookingsUsecase:IGetBooking,
    @inject(USECASE_TOKENS.VERIFY_DRIVER_PAYMENT_ACCOUNT_USECASE)
private verifyDriverPaymentAccount: IVerifyDriverPaymentAccount
  ) {}

   async registerDriver(req: Request, res: Response, next: NextFunction) {
    try {
     
      const response = await await this.registerDriverUseCase.execute(req.body);
      res.status(HTTP_STATUS_CODES.OK).json({ success: true, ...response });
    } catch (error) {
    next(error)
    }
  }
   async verifyOTPDriver(req: Request, res: Response,next:NextFunction) {
    try {
      const { email, otp } = req.body;

      if (otp.length < 6) {
        throw new AuthError(
          ERROR_MESSAGES.OTP_INVALID,
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      

      const { accessToken, refreshToken, user } =
        await this.verifyOtpUsecase.execute(email, otp, "driver");
      res.cookie(`driverRefreshToken`, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ success: true, accessToken, user });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response,next:NextFunction) {
    try {
      const { email, password, role } = req.body;

      console.log(req.body);

      const { accessToken, refreshToken } = await this.loginUsecase.execute(
        email,
        password,
        role
      );

      const refreshTokenKey = `${role}RefreshToken`;

      res.cookie(refreshTokenKey, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(HTTP_STATUS_CODES.OK).json({
        accessToken,
        role,
      });
    } catch (error) {
      next(error);
    }
  }
   async getDriverProfile(req:AuthenticatedRequest, res: Response,next:NextFunction) {
    try {
      const driverId =req.user?.id
      if (!driverId) {
       throw new AuthError(ERROR_MESSAGES.DRIVER_ID_NOT_FOUND,HTTP_STATUS_CODES.BAD_REQUEST)
    }
      const driver = await this.getDriverProfileUsecase.execute(driverId);

      res.status(HTTP_STATUS_CODES.OK).json({ success: true, driver });
    } catch (error) {
      next(error)
    }
  }

 async getUserById(req: AuthenticatedRequest, res: Response,next:NextFunction) {
    try {
      const userId = req.params.id; 

      if (!userId) {
        throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND,HTTP_STATUS_CODES.BAD_REQUEST) 
      }
      const user = await this.getUserDataUsecase.execute(userId);
      res.status(HTTP_STATUS_CODES.OK).json({ success: true, user });
    } catch (error) {
       next(error)
    }
  }

 async editDriverProfile(req:AuthenticatedRequest, res: Response,next:NextFunction) {
    try {
      const driverId = req.params.id; 
      const updateData = req.body; 
 
      const updatedDriver = await this.editDriverProfileUseCase.execute(
        driverId,
        updateData
      );
        
      res.status(HTTP_STATUS_CODES.OK).json({success: true, driver: updatedDriver });
    } catch (error) {
     next(error)
    }
  }
  
 async onboardDriver(req: AuthenticatedRequest, res: Response,next:NextFunction) {
    try {
      let{ email, driverId } = req.body;
      
if(!driverId){
  driverId=req.user?.id
}
      if (!email || !driverId) {
        throw new AuthError( 'Email and driverId are required',HTTP_STATUS_CODES.BAD_REQUEST
        )
      }

      const onboardingUrl = await this.onboardDriverUseCase.execute(email, driverId);

      res.status(HTTP_STATUS_CODES.OK).json({ url: onboardingUrl });
    } catch (error) {
     next(error)
    }
  }
 async getBookingsForDriver(req: AuthenticatedRequest, res: Response,next:NextFunction){
   const driverId=req.user?.id;
   if(!driverId){
    throw new AuthError(ERROR_MESSAGES.DRIVER_ID_NOT_FOUND,HTTP_STATUS_CODES.BAD_REQUEST)
   
   }
    const { page = 1, limit = 2 } = req.query;

    try {
   

      const paginatedBookings: PaginatedResult<rideHistory> =
        await this.getUserBookingsUsecase.execute(driverId, Number(page), Number(limit));

      res.status(200).json({
        data: paginatedBookings.data,
        total: paginatedBookings.total,
        totalPages: paginatedBookings.totalPages,
        currentPage: paginatedBookings.page,
      });
    } catch (error: any) {
      next(error)
    }
  }

async verifyAccount(req: Request, res: Response,next:NextFunction) {
    try {
      const { driverId } = req.body;
    
      await this.verifyDriverPaymentAccount.execute(driverId);
      res.json({ success: true, message: 'Payment activated for driver' });
    } catch (error: any) {
     next(error)
     
    }
  }
  
}
