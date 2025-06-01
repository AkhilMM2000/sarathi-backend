import { Request, Response } from "express";
import { container } from "tsyringe";
import { RegisterUser } from "../../application/use_cases/RegisterUser";
import { VerifyOTP } from "../../application/use_cases/VerifyOTP";
import { ResendOTP } from "../../application/use_cases/ResendOTP";
import { Login } from "../../application/use_cases/Login";

import { RegisterDriver } from "../../application/use_cases/RegisterDriver";
import { AuthError } from "../../domain/errors/Autherror";
import { GetDriverProfile } from "../../application/use_cases/Driver/Getdriverprofile";
import { EditDriverProfile } from "../../application/use_cases/Driver/EditDriverProfile";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { OnboardDriverUseCase } from "../../application/use_cases/Driver/DriverOnboarding";
import { GetUserBookings } from "../../application/use_cases/Driver/Getdriverbooking";
import { BookingWithUsername, PaginatedResult, rideHistory } from "../../domain/repositories/IBookingrepository";
import { VerifyDriverPaymentAccount } from "../../application/use_cases/Driver/VerifyAccountStatus";
import { GetUserData } from "../../application/use_cases/User/GetUserData";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";

export class DriverController {
  static async registerDriver(req: Request, res: Response) {
    try {
      const DriverRegister = container.resolve(RegisterDriver);
      const response = await DriverRegister.execute(req.body);
      res.status(201).json({ success: true, ...response });
    } catch (error) {
      res
        .status(400)
        .json({
          success: false,
          error: error instanceof Error ? error.message : "Registration failed",
        });
    }
  }
  static async verifyOTPDriver(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      console.log(req.body);

      const verifyOTP = container.resolve(VerifyOTP);
      const result = await verifyOTP.execute(req, res, email, otp, "driver");
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res
        .status(400)
        .json({
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password, role } = req.body;
      console.log(req.body);

      const loginUseCase = container.resolve(Login);
      const { accessToken, refreshToken } = await loginUseCase.execute(
        email,
        password,
        role
      );

      // Set refresh token cookie
      const refreshTokenKey = `${role}RefreshToken`;
      res.cookie(refreshTokenKey, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken, role });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({ success: false, error: "Something went wrong" });
    }
  }
  static async getDriverProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const driverId =req.user?.id;
      if (!driverId) {
        res.status(400).json({ success: false, error: "Driver ID is required" });
        return 
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
static async getUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id; 
console.log(' useridfor chat',userId)
      if (!userId) {
        res.status(400).json({ success: false, error: "User ID is required" });
        return
      }
     
      
      const getUserData = container.resolve(GetUserData);
      const user = await getUserData.execute(userId);


      res.status(200).json({ success: true, user });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return
      }

      console.error("Error fetching user data:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }

  static async editDriverProfile(req: Request, res: Response) {
    try {
      const driverId = req.params.id; 
      const updateData = req.body; 
 
      const editDriverProfileUseCase = container.resolve(EditDriverProfile);
      const updatedDriver = await editDriverProfileUseCase.execute(
        driverId,
        updateData
      );
        
      res.status(200).json({success: true, driver: updatedDriver });
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
  
  static async onboardDriver(req: AuthenticatedRequest, res: Response) {
    try {
      let{ email, driverId } = req.body;
      console.log('onboard driver',req.body)
if(!driverId){
  driverId=req.user?.id
}
      if (!email || !driverId) {
        res.status(400).json({ message: 'Email and driverId are required' });
        return
      }

      const onboardDriverUseCase = container.resolve(OnboardDriverUseCase);
      const onboardingUrl = await onboardDriverUseCase.execute(email, driverId);

      res.status(200).json({ url: onboardingUrl });
    } catch (error: any) {
      console.error('Stripe onboarding error:', error);
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }
    }
  }
  static async getBookingsForDriver(req: AuthenticatedRequest, res: Response){
   const driverId=req.user?.id;
   if(!driverId){
    res.status(400).json({ message: ERROR_MESSAGES.DRIVER_ID_NOT_FOUND });
    return 
   }
    const { page = 1, limit = 2 } = req.query;

    try {
      const getUserBookings = container.resolve(GetUserBookings);

      const paginatedBookings: PaginatedResult<rideHistory> =
        await getUserBookings.execute(driverId, Number(page), Number(limit));

      res.status(200).json({
        data: paginatedBookings.data,
        total: paginatedBookings.total,
        totalPages: paginatedBookings.totalPages,
        currentPage: paginatedBookings.page,
      });
    } catch (error: any) {
      console.error('Stripe onboarding error:', error);
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }
    }
  }

  static async verifyAccount(req: Request, res: Response) {
    try {
      const { driverId } = req.body;
      const useCase = container.resolve(VerifyDriverPaymentAccount);
      await useCase.execute(driverId);
      res.json({ success: true, message: 'Payment activated for driver' });
    } catch (error: any) {
      console.error('Stripe onboarding error:', error);
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }
    }
  }
  
}
