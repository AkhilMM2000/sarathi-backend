import { NextFunction, Request, Response } from "express";
import { container, inject } from "tsyringe";
import { RegisterUser } from "../../application/use_cases/User/RegisterUser";
import { VerifyOTP } from "../../application/use_cases/VerifyOTP";
import { ResendOTP } from "../../application/use_cases/ResendOTP";
import { Login } from "../../application/use_cases/Login";

import { AddVehicle } from "../../application/use_cases/User/AddVehicle";
import { EditVehicle } from "../../application/use_cases/User/EditVehicle";
import { AuthError } from "../../domain/errors/Autherror";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { GetAllVehicle } from "../../application/use_cases/GetAllVehicle";
import { GetUserData } from "../../application/use_cases/User/GetUserData";
import { UpdateUserData } from "../../application/use_cases/User/UpdateUserData";
import { GetVehiclesByUser } from "../../application/use_cases/User/GetVehiclesByUser";
import { FindNearbyDrivers } from "../../application/use_cases/User/FindNearbyDrivers";
import { BookDriver } from "../../application/use_cases/User/BookDriver";
import { CreatePaymentIntent } from "../../application/use_cases/User/CreatePaymentIntent";
import { GetDriverProfile } from "../../application/use_cases/Driver/Getdriverprofile";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { walletTransaction } from "../../application/use_cases/User/walletTransaction";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { SubmitDriverReview } from "../../application/use_cases/User/SubmitRating";
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

export class UserController {
  constructor(
    @inject(TOKENS.REGISTER_USER_USECASE)
    private registerUsecase: IRegisterUser,
    @inject(TOKENS.GET_USER_DATA_USECASE)
    private getUserDataUsecase: IGetUserData,
    @inject(TOKENS.VERIFY_OTP_USECAE)
    private verifyOtpUsecase: IVerifyOtp,
    @inject(TOKENS.RESEND_OTP_USECASE)
    private resendOtpUsecase:IResendOTP,
    @inject(TOKENS.LOGIN_USECASE)
    private loginUsecase:ILogin,
    @inject(TOKENS.ADD_VEHICLE_USECASE)
    private addVehicleUsecase:IAddVehicleUseCase,
    @inject (TOKENS.EDIT_VEHICLE_USECASE)
    private editVehicleUsecase:IEditVehicleUseCase,
    @inject(TOKENS.GET_VEHICLES_BY_USER_USECASE)
    private getVehiclebyUserUsecase:IGetVehiclesByUserUseCase,
    @inject(TOKENS.UPDATE_USER_USECASE)
    private updateuserUsecase:IUpdateUserData,
      @inject(TOKENS.FIND_NEARBY_DRIVERS_USECASE)
    private findNearbyDrivers: FindNearbyDrivers
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
   async resendOTP(req: Request, res: Response,next:NextFunction) {
    try {
      const { email, role } = req.body;
      console.log(email, role);

      
      const result = await this.resendOtpUsecase.execute(email, role);
      res.status(HTTP_STATUS_CODES.OK).json({ success: true, message: result.message });
    } catch (error) {
      next(error)
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
      next(error)
    }
  }

   async addVehicle(
    req: AuthenticatedRequest,
    res: Response,
    next:NextFunction
  ): Promise<void> {
    try {
      const vehicleData = req.body;

    
      const vehicle = await this.addVehicleUsecase.execute({
        ...vehicleData,
        userId: req.user?.id,
      });

      res.status(HTTP_STATUS_CODES.OK).json({ success: true, data: vehicle });
    } catch (error) {
     next(error)
    }
  }

   async editVehicle(req: Request, res: Response,next:NextFunction) {
    try {
      const { vehicleId } = req.params;
      const updateData = req.body;
      console.log(updateData);

      
      const updatedVehicle = await this.editVehicleUsecase.execute(
        vehicleId,
        updateData
      );

      res.status(HTTP_STATUS_CODES.OK).json({ success: true, data: updatedVehicle });
    } catch (error) {
      next(error)
    }
  }

  async getAllVehicle(req: AuthenticatedRequest, res: Response,next:NextFunction) {
    try {
      const userId = req.user?.id;

    
      const vehicles = await this.getVehiclebyUserUsecase.execute(userId!);

      res.status(HTTP_STATUS_CODES.OK).json({ success: true, data: vehicles });
    } catch (error) {
      next(error)
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

 async updateUser(req: Request, res: Response,next:NextFunction) {
    try {
      const userId = req.params.id;
      const updateData = req.body;
      if (!userId) {
       throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND,HTTP_STATUS_CODES.BAD_REQUEST)
      }
      const updatedUser = await this.updateuserUsecase.execute(userId, updateData);

      res.status(HTTP_STATUS_CODES.OK).json({ success: true, user: updatedUser });
    } catch (error:any) {
      next(error)
    }
  }

   async fetchDrivers(req: AuthenticatedRequest, res: Response,next:NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        
        throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND,HTTP_STATUS_CODES.BAD_REQUEST)
      }

   

      // Execute the use case and fetch drivers
      const drivers = await this.findNearbyDrivers.execute(userId);
      console.log(drivers, "got it ");
      res.status(HTTP_STATUS_CODES.OK).json({ success: true, drivers });
    } catch (error) {
      next(error)
    }
  }

  static async createPaymentIntent(req: Request, res: Response) {
    const { amount, driverId } = req.body;
    console.log(req.body);
    if (!amount || !driverId) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    try {
      const createPaymentIntent = container.resolve(CreatePaymentIntent);

      const result = await createPaymentIntent.execute({
        amount,
        driverId,
      });

      res.json({
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      });
    } catch (error: any) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, error: error.message });
        return;
      }

      console.error("Error fetching user data:", error);
      res
        .status(500)
        .json({ success: false, error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
  static async getDriverById(req: Request, res: Response) {
    try {
      const driverId = req.params.id;
      if (!driverId) {
        res
          .status(400)
          .json({ success: false, error: ERROR_MESSAGES.DRIVER_ID_NOT_FOUND });
        return;
      }

      const getDriverProfile = container.resolve(GetDriverProfile);
      const driver = await getDriverProfile.execute(driverId);

      res.status(200).json({ success: true, driver });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }
    }
  }

  static async WalletTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const { page, limit } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({ success: false, error: ERROR_MESSAGES.USER_ID_NOT_FOUND });
        return;
      }

      const getWalletTransaction = container.resolve(walletTransaction);

      const transactionHistory =
        await getWalletTransaction.getTransactionHistory(
          userId,
          Number(page),
          Number(limit)
        );
      const ballence = await getWalletTransaction.getWalletBallence(userId);
      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ success: true, transactionHistory, ballence });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }
      res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: "Something went wrong" });
      return;
    }
  }

  static async submitReview(req: AuthenticatedRequest, res: Response) {
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
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const useCase = container.resolve(SubmitDriverReview);

      const createdReview = await useCase.execute({
        driverId,
        userId,
        rideId,
        rating,
        review,
      });
      res
        .status(201)
        .json({ message: "Review submitted", review: createdReview });
    } catch (error: any) {
      console.log(error);
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }
      res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: "Something went wrong" });
      return;
    }
  }
}
