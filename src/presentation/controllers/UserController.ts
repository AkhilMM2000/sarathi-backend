import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { AuthError } from "../../domain/errors/Autherror";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";

import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { IRegisterUser } from "../../application/use_cases/User/interfaces/IRegisterUser";
import { TOKENS } from "../../constants/Tokens";
import { INFO_MESSAGES } from "../../constants/Info_Messages";
import { IGetUserData } from "../../application/use_cases/User/interfaces/IGetUserData";
import { IVerifyOtp } from "../../application/use_cases/Interfaces/IVerifyOtp";
import { IResendOTP } from "../../application/use_cases/Interfaces/IResendOTP";
import { ILogin } from "../../application/use_cases/Interfaces/ILogin";
import { IAddVehicleUseCase } from "../../application/use_cases/Interfaces/IAddvehicle";
import { IEditVehicleUseCase } from "../../application/use_cases/User/interfaces/IEditVehicleUseCase";
import { IGetVehiclesByUserUseCase } from "../../application/use_cases/User/interfaces/IGetVehiclesByUserUseCase";
import { IUpdateUserData } from "../../application/use_cases/User/interfaces/IUpdateUserData";
import { ICreatePaymentIntent } from "../../application/use_cases/User/interfaces/ICreatePaymentIntent";
import { IGetDriverProfile } from "../../application/use_cases/Driver/interfaces/IGetDriverProfile";
import { IWalletTransaction } from "../../application/use_cases/User/interfaces/IWalletTransaction";
import { ISubmitDriverReview } from "../../application/use_cases/User/interfaces/ISubmitDriverReview";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { IFindNearbyDriversUseCase } from "../../application/use_cases/User/interfaces/IFindNearbyDriversUseCase";
import { IGetNearbyDriverDetailsUseCase } from "../../application/use_cases/Interfaces/IGetNearbyDriverDetailsUseCase";
import { ZodHelper } from "../dto/common/ZodHelper";
import { AddVehicleSchema, CreatePaymentIntentSchema, DriverIdParamSchema, EditVehicleSchema, FetchDriversSchema, GetNearbyDriverQuerySchema, LoginSchema, RegisterSchema, ResendOtpSchema, SubmitReviewSchema, toUserResponse, UpdateUserSchema, VehicleIdParamSchema, VerifyOtpSchema, WalletPaginationSchema } from "../dto/user/UserDTO";
import { toDriverListResponse, toDriverResponse } from "../dto/user/DriverDTO";
import { z } from "zod";

@injectable()
export class UserController {
  constructor(
    @inject(TOKENS.REGISTER_USER_USECASE)
    private registerUsecase: IRegisterUser,
    @inject(TOKENS.GET_USER_DATA_USECASE)
    private getUserDataUsecase: IGetUserData,
    @inject(TOKENS.VERIFY_OTP_USECAE)
    private verifyOtpUsecase: IVerifyOtp,
    @inject(TOKENS.RESEND_OTP_USECASE)
    private resendOtpUsecase: IResendOTP,
    @inject(TOKENS.LOGIN_USECASE)
    private loginUsecase: ILogin,
    @inject(TOKENS.ADD_VEHICLE_USECASE)
    private addVehicleUsecase: IAddVehicleUseCase,
    @inject(TOKENS.EDIT_VEHICLE_USECASE)
    private editVehicleUsecase: IEditVehicleUseCase,
    @inject(TOKENS.GET_VEHICLES_BY_USER_USECASE)
    private getVehiclebyUserUsecase: IGetVehiclesByUserUseCase,
    @inject(TOKENS.UPDATE_USER_USECASE)
    private updateuserUsecase: IUpdateUserData,
    @inject(USECASE_TOKENS.FIND_NEARBY_DRIVERS_USECASE)
    private findNearbyDrivers: IFindNearbyDriversUseCase,
    @inject(TOKENS.CREATE_PAYMENT_INTENT_USECASE)
    private createPaymentUsecase: ICreatePaymentIntent,
    @inject(TOKENS.GET_DRIVER_PROFILE_USECASE)
    private getDriverProfileUsecase: IGetDriverProfile,
    @inject(TOKENS.WALLET_TRANSACTION_USECASE)
    private walletTransactionUsecase: IWalletTransaction,
    @inject(TOKENS.SUBMIT_REVIEW_USECASE)
    private submitReviewUsecase: ISubmitDriverReview,
    @inject( USECASE_TOKENS.GET_NEARBY_DRIVER_DETAILS_USECASE)
  private getNearbyDriverDetailsUseCase:IGetNearbyDriverDetailsUseCase
  ) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

     
      // 1. DTO Validation
      const validatedData = ZodHelper.validate(RegisterSchema, req.body);

      // 2. Execute Use Case (Unchanged signature)
      // Note: registerUsecase returns { message: string } during the OTP phase
      const result = await this.registerUsecase.execute(validatedData as any);
     
      // 3. Response Mapping
      res.status(HTTP_STATUS_CODES.CREATED).json({ 
        success: true, 
        message: INFO_MESSAGES.USER.REGISTERED, 
        user: result 
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
  async verifyOTPUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. DTO Validation
      const { email, otp } = ZodHelper.validate(VerifyOtpSchema, req.body);

      // 2. Execute Use Case
      const { accessToken, refreshToken, user } =
        await this.verifyOtpUsecase.execute(email, otp, "user");

      // 3. Set Cookie and Response
      res.cookie(`userRefreshToken`, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
  async resendOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. DTO Validation
      const { email, role } = ZodHelper.validate(ResendOtpSchema, req.body);

      // 2. Execute Use Case
      const result = await this.resendOtpUsecase.execute(email, role);

      // 3. Response
      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ success: true, message: result.message });
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
      const { email, password, role } = ZodHelper.validate(LoginSchema, req.body);

      // 2. Execute Use Case
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
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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

  async addVehicle(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // 1. DTO Validation
      const validatedData = ZodHelper.validate(AddVehicleSchema, req.body);
      const userId = req.user?.id;

      if (!userId) {
        throw new AuthError(
          ERROR_MESSAGES.USER_ID_NOT_FOUND,
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      // 2. Execute Use Case
      const vehicle = await this.addVehicleUsecase.execute({
        ...validatedData,
        userId: userId as any,
      });

      res.status(HTTP_STATUS_CODES.OK).json({ success: true, data: vehicle });
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

  async editVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. DTO Validation
      const { vehicleId } = ZodHelper.validate(VehicleIdParamSchema, req.params);
      const validatedData = ZodHelper.validate(EditVehicleSchema, req.body);

      // 2. Execute Use Case
      const updatedVehicle = await this.editVehicleUsecase.execute(
        vehicleId,
        validatedData
      );

      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ success: true, data: updatedVehicle });
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

  async getAllVehicle(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AuthError(
          ERROR_MESSAGES.USER_ID_NOT_FOUND,
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      const vehicles = await this.getVehiclebyUserUsecase.execute(userId!);

      res.status(HTTP_STATUS_CODES.OK).json({ success: true, data: vehicles });
    } catch (error) {
      next(error);
    }
  }


  async getUserData(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AuthError(
          ERROR_MESSAGES.USER_ID_NOT_FOUND,
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      const user = await this.getUserDataUsecase.execute(userId);

      res.status(HTTP_STATUS_CODES.OK).json({ success: true, user: toUserResponse(user as any) });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      
      // 1. DTO Validation
      const validatedData = ZodHelper.validate(UpdateUserSchema, req.body);

      if (!userId) {
        throw new AuthError(
          ERROR_MESSAGES.USER_ID_NOT_FOUND,
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      // 2. Execute Use Case with sanitized data
      const updatedUser = await this.updateuserUsecase.execute(userId, validatedData);

      // 3. Response Mapping
      if (!updatedUser) {
        throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
      }

      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        message: "User Profile Updated Sucessfully",
        user: toUserResponse(updatedUser as any),
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

  async fetchDrivers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // 1. Authenticated User Check
      const userId = req.user?.id;
      if (!userId) {
        throw new AuthError(
          ERROR_MESSAGES.USER_ID_NOT_FOUND,
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      // 2. Query Validation (Automatic page/limit numeric coercion)
      const { page, limit, search, lat, lng } = ZodHelper.validate(FetchDriversSchema, req.query);
console.log(page, limit, search, lat, lng,'page limit search lat lng')
      // 3. Execute the use case
      const paginatedDrivers = await this.findNearbyDrivers.execute(
        userId,
        page,
        limit,
        search,
        lat,
        lng
      );
console.log(paginatedDrivers,'paginated drivers')
      // 4. Map to safe Response DTOs
      res.status(HTTP_STATUS_CODES.OK).json({ 
        success: true, 
        drivers: {
          ...paginatedDrivers,
          data: toDriverListResponse(paginatedDrivers.data)
        }
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
  async getDriverDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      
      // 1. Param Validation
      const { driverId } = ZodHelper.validate(DriverIdParamSchema, req.params);
console.log(req.query,'query')
      // 2. Query Validation (Optional coordinates)
      const { lat, lng } = ZodHelper.validate(GetNearbyDriverQuerySchema, req.query);

      const userId = req.user?.id

      // 3. Execute and map to safe Response DTO
      const driver = await this.getNearbyDriverDetailsUseCase.execute(userId!, driverId, lat, lng);
console.log(driver,userId!, driverId, lat, lng,'driver');
      res.status(HTTP_STATUS_CODES.OK).json(toDriverResponse(driver));
    } catch (error: any) {
      console.log(error,'error')
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

  async createPaymentIntent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // 1. DTO Validation
      const { amount, driverId } = ZodHelper.validate(
        CreatePaymentIntentSchema,
        req.body
      );

      // 2. Execute Use Case
      const result = await this.createPaymentUsecase.execute({
        amount,
        driverId,
      });

      // 3. Response 
      res.status(HTTP_STATUS_CODES.OK).json({
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
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
  async getDriverById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // 1. Param Validation
      const { driverId } = ZodHelper.validate(DriverIdParamSchema, {
        driverId: req.params.id,
      });

      // 2. Execute
      const driver = await this.getDriverProfileUsecase.execute(driverId);
      console.log(driver,'driver')
      if (!driver) {
        throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
      }

      // 3. Response Mapping
      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ success: true, driver: toDriverResponse(driver) });
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

  async WalletTransaction(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // 1. DTO Validation (Automatic numeric coercion)
      const { page, limit } = ZodHelper.validate(WalletPaginationSchema, req.query);

      const userId = req.user?.id;
      if (!userId) {
        throw new AuthError(
          ERROR_MESSAGES.USER_ID_NOT_FOUND,
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      // 2. Execute
      const transactionHistory =
        await this.walletTransactionUsecase.getTransactionHistory(
          userId,
          page,
          limit
        );
      const ballence = await this.walletTransactionUsecase.getWalletBalance(
        userId
      );

      // 3. Response
      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ success: true, transactionHistory, ballence });
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

  async submitReview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // 1. DTO Validation
      const { driverId, rideId, rating, review } = ZodHelper.validate(
        SubmitReviewSchema,
        req.body
      );

      const userId = req.user?.id;
      if (!userId) {
        throw new AuthError(
          ERROR_MESSAGES.USER_ID_NOT_FOUND,
          HTTP_STATUS_CODES.UNAUTHORIZED
        );
      }

      // 2. Execute
      const createdReview = await this.submitReviewUsecase.execute({
        driverId,
        userId,
        rideId,
        rating,
        review,
      });

      // 3. Response
      res
        .status(HTTP_STATUS_CODES.CREATED)
        .json({ message: "Review submitted", review: createdReview });
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
