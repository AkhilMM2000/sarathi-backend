import { NextFunction, Request, Response } from "express";
import { inject } from "tsyringe";
import { AuthError } from "../../domain/errors/Autherror";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { FindNearbyDrivers } from "../../application/use_cases/User/FindNearbyDrivers";
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
    @inject(TOKENS.FIND_NEARBY_DRIVERS_USECASE)
    private findNearbyDrivers: FindNearbyDrivers,
    @inject(TOKENS.CREATE_PAYMENT_INTENT_USECASE)
    private createPaymentUsecase: ICreatePaymentIntent,
    @inject(TOKENS.GET_DRIVER_PROFILE_USECASE)
    private getDriverProfileUsecase: IGetDriverProfile,
    @inject(TOKENS.WALLET_TRANSACTION_USECASE)
    private walletTransactionUsecase: IWalletTransaction,
    @inject(TOKENS.SUBMIT_REVIEW_USECASE)
    private submitReviewUsecase: ISubmitDriverReview
  ) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.registerUsecase.execute(req.body);
      res
        .status(HTTP_STATUS_CODES.CREATED)
        .json({ success: true, message: INFO_MESSAGES.USER.REGISTERED, user });
    } catch (error) {
      next(error);
    }
  }
  async verifyOTPUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;

      if (otp.length < 6) {
        throw new AuthError(
          ERROR_MESSAGES.OTP_INVALID,
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      console.log(req.body);

      const { accessToken, refreshToken, user } =
        await this.verifyOtpUsecase.execute(email, otp, "user");
      res.cookie(`userRefreshToken`, refreshToken, {
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
  async resendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, role } = req.body;
      console.log(email, role);

      const result = await this.resendOtpUsecase.execute(email, role);
      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
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

  async addVehicle(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const vehicleData = req.body;

      const vehicle = await this.addVehicleUsecase.execute({
        ...vehicleData,
        userId: req.user?.id,
      });

      res.status(HTTP_STATUS_CODES.OK).json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  }

  async editVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;
      const updateData = req.body;
      console.log(updateData);

      const updatedVehicle = await this.editVehicleUsecase.execute(
        vehicleId,
        updateData
      );

      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ success: true, data: updatedVehicle });
    } catch (error) {
      next(error);
    }
  }

  async getAllVehicle(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;

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
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AuthError(
          ERROR_MESSAGES.USER_ID_NOT_FOUND,
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      const user = await this.getUserDataUsecase.execute(userId);

      res.status(HTTP_STATUS_CODES.OK).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const updateData = req.body;
      if (!userId) {
        throw new AuthError(
          ERROR_MESSAGES.USER_ID_NOT_FOUND,
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }
      const updatedUser = await this.updateuserUsecase.execute(
        userId,
        updateData
      );

      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ success: true, user: updatedUser });
    } catch (error: any) {
      next(error);
    }
  }

  async fetchDrivers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AuthError(
          ERROR_MESSAGES.USER_ID_NOT_FOUND,
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      // Execute the use case and fetch drivers
      const drivers = await this.findNearbyDrivers.execute(userId);
      console.log(drivers, "got it ");
      res.status(HTTP_STATUS_CODES.OK).json({ success: true, drivers });
    } catch (error) {
      next(error);
    }
  }

  async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    const { amount, driverId } = req.body;
    console.log(req.body);
    if (!amount || !driverId) {
      throw new AuthError(
        "missing amount or driverinfo",
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    try {
      const result = await this.createPaymentUsecase.execute({
        amount,
        driverId,
      });

      res.json({
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      });
    } catch (error: any) {
      next(error);
    }
  }
  async getDriverById(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.params.id;
      if (!driverId) {
        res
          .status(400)
          .json({ success: false, error: ERROR_MESSAGES.DRIVER_ID_NOT_FOUND });
        return;
      }

      const driver = await this.getDriverProfileUsecase.execute(driverId);

      res.status(HTTP_STATUS_CODES.OK).json({ success: true, driver });
    } catch (error) {
      next(error);
    }
  }

  async WalletTransaction(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { page, limit } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        throw new AuthError(
          ERROR_MESSAGES.USER_ID_NOT_FOUND,
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      const transactionHistory =
        await this.walletTransactionUsecase.getTransactionHistory(
          userId,
          Number(page),
          Number(limit)
        );
      const ballence = await this.walletTransactionUsecase.getWalletBalance(
        userId
      );
      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ success: true, transactionHistory, ballence });
    } catch (error) {
      next(error);
    }
  }

  async submitReview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { driverId, rideId, rating, review } = req.body;
      const userId = req.user?.id;
      if (!driverId || !rideId || !rating) {
        throw new AuthError(
          "All fields are required",
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }
      if (!userId) {
        throw new AuthError(
          ERROR_MESSAGES.USER_ID_NOT_FOUND,
          HTTP_STATUS_CODES.UNAUTHORIZED
        );
      }

      const createdReview = await this.submitReviewUsecase.execute({
        driverId,
        userId,
        rideId,
        rating,
        review,
      });
      res
        .status(HTTP_STATUS_CODES.CREATED)
        .json({ message: "Review submitted", review: createdReview });
    } catch (error: any) {
      next(error);
    }
  }
}
