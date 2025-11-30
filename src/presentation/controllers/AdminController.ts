import { container, inject, injectable } from "tsyringe";

import { NextFunction, Request, Response } from "express";
import { AuthError } from "../../domain/errors/Autherror";
import { Login } from "../../application/use_cases/Login";
import { GetAllUsers } from "../../application/use_cases/Admin/GetAllusers";
import { BlockUserUseCase } from "../../application/use_cases/Admin/BlockUser";
import { GetDrivers } from "../../application/use_cases/Admin/GetDrivers";
import { AdminChangeDriverStatus } from "../../application/use_cases/Admin/AdminChangeDriverStatus";
import { BlockOrUnblockDriver } from "../../application/use_cases/Admin/BlockOrUnblockDriver";
import { GetVehiclesByUser } from "../../application/use_cases/User/GetVehiclesByUser";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { TOKENS } from "../../constants/Tokens";
import { ILogin } from "../../application/use_cases/Interfaces/ILogin";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { IGetAllUsersUseCase } from "../../application/use_cases/Admin/Interfaces/IGetAllUsersUseCase";
import { IBlockUserUseCase } from "../../application/use_cases/Admin/Interfaces/IBlockUserUseCase";
import { IGetDriversUseCase } from "../../application/use_cases/Admin/Interfaces/IGetDriversUseCase";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { IAdminChangeDriverStatusUseCase } from "../../application/use_cases/Admin/Interfaces/IAdminChangeDriverStatus";
import { IBlockOrUnblockDriverUseCase } from "../../application/use_cases/Admin/Interfaces/IBlockOrUnblockDriverUseCase";

@injectable()
export class AdminController {
  constructor(
     @inject(TOKENS.LOGIN_USECASE)
    private loginUsecase: ILogin,
      @inject(USECASE_TOKENS.GET_ALL_USERS_USECASE)
    private getAllUsersUseCase: IGetAllUsersUseCase,
      @inject(USECASE_TOKENS.BLOCK_USER_USECASE)
  private blockUserUseCase: IBlockUserUseCase,
     @inject(USECASE_TOKENS.GET_DRIVERS_USECASE)
    private getDriversUseCase: IGetDriversUseCase,
      @inject(USECASE_TOKENS.ADMIN_CHANGE_DRIVER_STATUS_USECASE)
  private changeDriverStatusUseCase: IAdminChangeDriverStatusUseCase,
   @inject(USECASE_TOKENS.BLOCK_OR_UNBLOCK_DRIVER_USECASE)
    private blockOrUnblockDriverUseCase: IBlockOrUnblockDriverUseCase
  ){
    
  }
  async login(req: Request, res: Response,next:NextFunction) {
    try {
      const login = container.resolve(Login);
      const { email, password, role } = req.body;

      console.log(req.body);

      const { accessToken, refreshToken } = await this.loginUsecase.execute(
        email,
        password,
        req.body.role
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
        message:"your admin login successfull"
      });
    } catch (error) {
        next(error);
    }
  }

 async getAllUsers(req: Request, res: Response,next:NextFunction) {
    try {
    
      const usersWithVehicleCount =  await this.getAllUsersUseCase.execute();

      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        data: usersWithVehicleCount,
      });
    } catch (error) {
    next(error)
    }
  }

 async updateUserStatus(req: Request, res: Response,next:NextFunction) {
    try {
      const { userId } = req.params;
      const { isBlock} = req.body
     
      
    
      const blockedUser = await this.blockUserUseCase.execute(userId,isBlock);


      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        message: isBlock
        ? "User blocked successfully"
        : "User unblocked successfully",
        user: blockedUser,
      });
    } catch (error) {
      next(error)
    }
  }

   async getAllDrivers(req: Request, res: Response,next:NextFunction) {
    try {
    
      const drivers = await this.getDriversUseCase.execute();

      res.status(HTTP_STATUS_CODES.OK).json(drivers);
    } catch (error) {
next(error)
       }
  }

   async changeDriverStatus(req: Request, res: Response,next:NextFunction) {
    try {
      const { driverId } = req.params;
      const {  status, reason } = req.body;

      

      // Execute the use case
      const updatedDriver = await this.changeDriverStatusUseCase.execute(driverId, status, reason);

      if (!updatedDriver) {
        
      throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND,HTTP_STATUS_CODES.NOT_FOUND)
      }

     res.status(HTTP_STATUS_CODES.OK).json({
        message: "Driver status updated successfully",
        driver: updatedDriver
      });
    } catch (error: any) {
       next(error)
    }
  }

   async handleBlockStatus(req: Request, res: Response,next:NextFunction){
    try {
      const { driverId } = req.params;
      const { isBlock} = req.body;

      // Validate input
      if (typeof isBlock!== "boolean") {
        res.status(400).json({ message: "Invalid isBlocked value. Must be a boolean." });
        return
      }

  

      // Execute the use case
      await this.blockOrUnblockDriverUseCase.execute(driverId, isBlock);

    res.status(HTTP_STATUS_CODES.OK).json({ success:true, message: `Driver ${isBlock ? "blocked" : "unblocked"} successfully` });
    } catch (error: any) {
    next(error)
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
