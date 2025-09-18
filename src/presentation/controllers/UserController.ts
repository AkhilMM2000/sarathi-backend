import { Request, Response } from "express";
import { container } from "tsyringe";
import { RegisterUser } from "../../application/use_cases/RegisterUser";
import { VerifyOTP } from "../../application/use_cases/VerifyOTP";
import { ResendOTP } from "../../application/use_cases/ResendOTP";
import { Login } from "../../application/use_cases/Login";

import { AddVehicle } from "../../application/use_cases/AddVehicle";
import { EditVehicle } from "../../application/use_cases/EditVehicle";
import { AuthError } from "../../domain/errors/Autherror";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { GetAllVehicle } from "../../application/use_cases/GetAllVehicle";
import { GetUserData } from "../../application/use_cases/User/GetUserData";
import { UpdateUserData } from "../../application/use_cases/User/UpdateUserData";
import { GetVehiclesByUser } from "../../application/use_cases/Admin/GetVehiclesByUser";
import { FindNearbyDrivers } from "../../application/use_cases/User/FindNearbyDrivers";
import { BookDriver } from "../../application/use_cases/User/BookDriver";
import { CreatePaymentIntent } from "../../application/use_cases/User/CreatePaymentIntent";
import { GetDriverProfile } from "../../application/use_cases/Driver/Getdriverprofile";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { walletTransaction } from "../../application/use_cases/User/walletTransaction";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { SubmitDriverReview } from "../../application/use_cases/User/SubmitRating";


export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const registerUser = container.resolve(RegisterUser);
      const user = await registerUser.execute(req.body);
      res
        .status(201)
        .json({ success: true, message: "User registered successfully", user });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({ success: false, error: "Something went wrong" });
      return;
    }
  }

  static async verifyOTPUser(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

 if(otp.length<6){
  throw new AuthError('please enter complete otp',400)

 }

      console.log(req.body);

      const verifyOTP = container.resolve(VerifyOTP);

      const result = await verifyOTP.execute(req, res, email, otp, "user");

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({ success: false, error: "Something went wrong" });
      return;
    }
  }
  static async resendOTP(req: Request, res: Response) {
    try {
      const { email, role } = req.body;
      console.log(email, role);

      const resendOTP = container.resolve(ResendOTP);
      const result = await resendOTP.execute(email, role);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const login = container.resolve(Login);
      const { email, password, role } = req.body;

      console.log(req.body);

      const { accessToken, refreshToken } = await login.execute(
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
      res.status(200).json({
        accessToken,
        role,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({ success: false, error: "Something went wrong" });
      return;
    }
  }

  static async addVehicle(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const vehicleData = req.body;

      const addVehicleUseCase = container.resolve(AddVehicle);
      const vehicle = await addVehicleUseCase.execute({
        ...vehicleData,
        userId: req.user?.id,
      });

      res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    }
  }

  static async editVehicle(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      const updateData = req.body;
      console.log(updateData);

      const editVehicleUseCase = container.resolve(EditVehicle);
      const updatedVehicle = await editVehicleUseCase.execute(
        vehicleId,
        updateData
      );

      res.status(200).json({ success: true, data: updatedVehicle });
    } catch (error) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
      }
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  static async getAllVehicle(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;

      // Check if userId is missing or not a string
      if (!userId || typeof userId !== "string") {
        res
          .status(400)
          .json({ success: false, message: "Invalid or missing user ID" });
        return;
      }

      const getVehiclesByUser = container.resolve(GetVehiclesByUser);
      const vehicles = await getVehiclesByUser.execute(userId);

      res.status(200).json({ success: true, data: vehicles });
    } catch (error) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
      }
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  static async getUserData(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id; // Assuming user ID is set in `req.user` by authentication middleware

      if (!userId) {
        res.status(400).json({ success: false, error: "User ID is required" });
        return;
      }

      const getUserData = container.resolve(GetUserData);
      const user = await getUserData.execute(userId);

      res.status(200).json({ success: true, user });
    } catch (error) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, error: error.message });
        return;
      }

      console.error("Error fetching user data:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const updateData = req.body;

      if (!userId) {
        res
          .status(400)
          .json({ success: false, message: "User ID is required" });
        return;
      }

      const updateUserData = container.resolve(UpdateUserData);
      const updatedUser = await updateUserData.execute(userId, updateData);

      res.status(200).json({ success: true, user: updatedUser });
    } catch (error: any) {
      res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message });
      return;
    }
  }

  static async fetchDrivers(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(400).json({ message: ERROR_MESSAGES.USER_ID_NOT_FOUND });
        return;
      }

      // Resolve the use case
      const findNearbyDrivers = container.resolve(FindNearbyDrivers);

      // Execute the use case and fetch drivers
      const drivers = await findNearbyDrivers.execute(userId);
console.log(drivers,'got it ')
      res.status(200).json({ success: true, drivers });
    } catch (error) {
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

  const {page, limit} = req.query;
      const userId = req.user?.id; 


      if (!userId) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ success: false, error:ERROR_MESSAGES.USER_ID_NOT_FOUND });
        return;
      }

      const getWalletTransaction = container.resolve(walletTransaction);

const transactionHistory = await getWalletTransaction.getTransactionHistory(userId,Number(page),Number(limit));
const ballence= await getWalletTransaction.getWalletBallence(userId);
 res.status(HTTP_STATUS_CODES.OK).json({ success: true, transactionHistory,ballence });

    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error: "Something went wrong" });
      return;
    }
  }


   static async submitReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { driverId, rideId, rating, review } = req.body;
      const userId = req.user?.id;
      if(!driverId || !rideId || !rating) {
        throw new AuthError("All fields are required", HTTP_STATUS_CODES.BAD_REQUEST);
      }
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
         return
      }

      const useCase = container.resolve(SubmitDriverReview);

      const createdReview = await useCase.execute({
        driverId,
        userId,
        rideId,
        rating,
        review,
      });
res.status(201).json({ message: "Review submitted", review: createdReview });
    } catch (error: any) {
      console.log(error)
     if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error: "Something went wrong" });
      return;
    }
  }
}