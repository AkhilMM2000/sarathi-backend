import jwt from "jsonwebtoken";
import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../domain/repositories/IUserepository"; 
import { IDriverRepository } from "../../domain/repositories/IDriverepository";
import { AuthService } from "../services/AuthService";
import { User } from "../../domain/models/User";
import { Driver } from "../../domain/models/Driver";
import { AuthError } from "../../domain/errors/Autherror";
import { TOKENS } from "../../constants/Tokens";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { IRefreshTokenUseCase } from "./Interfaces/IRefreshTokenUseCase";
@injectable()

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
     @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository,
      @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository
    
    ) {}

  async execute(refreshToken: string,role:"user"|"driver"|"admin"):Promise<string> {
    if (!refreshToken) {
      throw new AuthError(ERROR_MESSAGES.REFRESHTOKEN_NOTFOUND, HTTP_STATUS_CODES.FORBIDDEN);
    }

   
      const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string);

      let user: User | Driver | null = null;

      if (role === "user" || role === "admin") {
        user = await this.userRepository.findByEmail(decoded.email);

        if (!user) {
          throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
        }

        if (role === "admin" && user.role !== "admin") {
          throw new AuthError(ERROR_MESSAGES.NOT_AUTHORIZED_ADMIN, HTTP_STATUS_CODES.FORBIDDEN);
        }
      } else if (role === "driver") {
        user = await this.driverRepository.findByEmail(decoded.email);

        if (!user) {
          throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND,HTTP_STATUS_CODES.NOT_FOUND);
        }
      }

      if (!user) {
        throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
      }

      const accessToken = AuthService.generateAccessToken({ id: user._id, email: user.email, role });

      return accessToken
   
  }
}
