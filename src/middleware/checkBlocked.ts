import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../domain/repositories/IUserepository"; 
import { IDriverRepository } from "../domain/repositories/IDriverepository"; 
import { AuthenticatedRequest } from "./authMiddleware"; // Import AuthenticatedRequest type
import { isValidObjectId } from "mongoose";
import { TOKENS } from "../constants/Tokens";

@injectable()
export class CheckBlockedUserOrDriver {
  constructor(
    @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository,
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository
  ) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const role = req.user?.role; 
     
      
      if (!userId || !role) {
        res.status(401).json({ message: "Unauthorized" });
        return 
        
      }
   

      let userOrDriver;
      if (role === "user") {
        if (!isValidObjectId(userId)) {
        
          
          res.status(400).json({ message: "Invalid user ID format" });
          return;
        }
        userOrDriver = await this.userRepository.getUserById(userId);
      }
       else if (role === "driver") {
        userOrDriver = await this.driverRepository.findDriverById(userId);
      } else {
       res.status(403).json({ message: "Invalid role" });
       return 
      }

      if (!userOrDriver) {
         res.status(401).json({ message: "Account not found" });
         return 
      }

      if (userOrDriver.isBlock) {
        res.status(403).json({ blocked: true, message: "Your account is blocked. Contact support." });
        return;
      }
      
 next(); 
    } catch (error) {
      console.error("Error checking blocked user/driver:", error);
     res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
