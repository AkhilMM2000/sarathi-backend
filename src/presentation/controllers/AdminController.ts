import { container } from "tsyringe";

import { Request, Response } from "express";
import { AuthError } from "../../domain/errors/Autherror";
import { Login } from "../../application/use_cases/Login";
import { GetAllUsers } from "../../application/use_cases/Admin/GetAllusers";
import { BlockUserUseCase } from "../../application/use_cases/Admin/BlockUser";
import { GetDrivers } from "../../application/use_cases/Admin/GetDrivers";
import { AdminChangeDriverStatus } from "../../application/use_cases/Admin/AdminChangeDriverStatus";
import { BlockOrUnblockDriver } from "../../application/use_cases/Admin/BlockOrUnblockDriver";
import { GetVehiclesByUser } from "../../application/use_cases/Admin/GetVehiclesByUser";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";

export class AdminController {
  static async login(req: Request, res: Response) {
    try {
      const login = container.resolve(Login);
      const { email, password, role } = req.body;

      console.log(req.body);

      const { accessToken, refreshToken } = await login.execute(
        email,
        password,
        req.body.role
      );

      const refreshTokenKey = `${role}RefreshToken`;

      res.cookie(refreshTokenKey, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        accessToken,
        role,
        message:"your admin login successfull"
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

  static async getAllUsers(req: Request, res: Response) {
    try {
      const getAllUsers = container.resolve(GetAllUsers);
      const usersWithVehicleCount = await getAllUsers.execute();

      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        data: usersWithVehicleCount,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch users",
      });
    }
  }

  static async updateUserStatus(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { isBlock} = req.body
     
      
      const blockUserUseCase = container.resolve(BlockUserUseCase);
      const blockedUser = await blockUserUseCase.execute(userId,isBlock);


      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        message: isBlock
        ? "User blocked successfully"
        : "User unblocked successfully",
        user: blockedUser,
      });
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

  static async getAllDrivers(req: Request, res: Response) {
    try {
      const getAllUsersUseCase = container.resolve(GetDrivers);
      const drivers = await getAllUsersUseCase.execute();

      res.status(HTTP_STATUS_CODES.OK).json(drivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch drivers", error });
    }
  }

  static async changeDriverStatus(req: Request, res: Response) {
    try {
      const { driverId } = req.params;
      const {  status, reason } = req.body;

      const adminChangeDriverStatus = container.resolve(AdminChangeDriverStatus);

      // Execute the use case
      const updatedDriver = await adminChangeDriverStatus.execute(driverId, status, reason);

      if (!updatedDriver) {
         res.status(404).json({ message: "Driver not found" });
         return
      }

     res.status(200).json({
        message: "Driver status updated successfully",
        driver: updatedDriver
      });
    } catch (error: any) {
       res.status(500).json({ message: error.message });
    }
  }

  static async handleBlockStatus(req: Request, res: Response){
    try {
      const { driverId } = req.params;
      const { isBlock} = req.body;

      // Validate input
      if (typeof isBlock!== "boolean") {
        res.status(400).json({ message: "Invalid isBlocked value. Must be a boolean." });
        return
      }

      // Get use case from DI container
      const blockOrUnblockDriver = container.resolve(BlockOrUnblockDriver);

      // Execute the use case
      await blockOrUnblockDriver.execute(driverId, isBlock);

    res.status(200).json({ success:true, message: `Driver ${isBlock ? "blocked" : "unblocked"} successfully` });
    } catch (error: any) {
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

  static async getVehiclesByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const getVehiclesByUser = container.resolve(GetVehiclesByUser);
      const vehicles = await getVehiclesByUser.execute(userId);
      
       res.status(200).json({ success: true, data: vehicles });
    } catch (error:any) {
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

}
