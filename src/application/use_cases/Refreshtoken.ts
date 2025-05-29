import jwt from "jsonwebtoken";
import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../domain/repositories/IUserepository"; 
import { IDriverRepository } from "../../domain/repositories/IDriverepository";
import { AuthService } from "../services/AuthService";
import { User } from "../../domain/models/User";
import { Driver } from "../../domain/models/Driver";
import { AuthError } from "../../domain/errors/Autherror";
@injectable()

export class RefreshToken {
  constructor(
     @inject("IUserRepository") private userRepository: IUserRepository,
      @inject("IDriverRepository") private driverRepository: IDriverRepository
    
    ) {}

  async execute(refreshToken: string,role:"user"|"driver"|"admin") {
    if (!refreshToken) {
      throw new AuthError("No refresh token provided", 403);
    }

    try {
      const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string);

      let user: User | Driver | null = null;

      if (role === "user" || role === "admin") {
        user = await this.userRepository.findByEmail(decoded.email);

        if (!user) {
          throw new AuthError("User not found", 404);
        }

        if (role === "admin" && user.role !== "admin") {
          throw new AuthError("Not authorized as admin", 403);
        }
      } else if (role === "driver") {
        user = await this.driverRepository.findByEmail(decoded.email);

        if (!user) {
          throw new AuthError("Driver not found", 404);
        }
      }

      if (!user) {
        throw new AuthError("User not found", 404);
      }

      const accessToken = AuthService.generateAccessToken({ id: user._id, email: user.email, role });

      return { success: true, accessToken };
    } catch (error) {
      throw new AuthError("Invalid refresh token", 403);
    }
  }
}
