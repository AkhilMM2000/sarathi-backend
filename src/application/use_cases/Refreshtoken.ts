import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../constants/Tokens";
import { IUserRepository } from "../../domain/repositories/IUserepository";
import { IDriverRepository } from "../../domain/repositories/IDriverepository";
import { AuthService } from "../services/AuthService";
import { AuthError } from "../../domain/errors/Autherror";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { IRefreshTokenUseCase } from "./Interfaces/IRefreshTokenUseCase";
import jwt from "jsonwebtoken";

@injectable()
export class RefreshToken implements IRefreshTokenUseCase {
  constructor(
    @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository,
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository
  ) {}

  async execute(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new AuthError(ERROR_MESSAGES.REFRESHTOKEN_NOTFOUND, HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    // 1. Decode token to find role
    const decoded = jwt.decode(refreshToken) as any;
    if (!decoded || !decoded.role) {
       throw new AuthError(ERROR_MESSAGES.REFRESHTOKEN_NOTFOUND, HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    const { role } = decoded;

    // 2. Verify token using unified secret
    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
      throw new AuthError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    // 3. Fetch User based on role
    let user: any = null;
    if (role === "user" || role === "admin") {
      user = await this.userRepository.findByEmail(decoded.email);
      
      if (!user) {
        throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
      }

      // Verify if admin role is actually authorized
      if (role === "admin" && user.role !== "admin") {
        throw new AuthError(ERROR_MESSAGES.NOT_AUTHORIZED_ADMIN, HTTP_STATUS_CODES.FORBIDDEN);
      }
    } else if (role === "driver") {
      user = await this.driverRepository.findByEmail(decoded.email);
      
      if (!user) {
        throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
      }
    }

    // 4. Generate new Access Token
    return AuthService.generateAccessToken({ 
      id: user._id || user.id, 
      email: user.email, 
      role 
    });
  }
}
