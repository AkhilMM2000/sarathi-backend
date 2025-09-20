import { injectable, inject } from "tsyringe";
import { OAuth2Client } from "google-auth-library";
import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { AuthService } from "../../services/AuthService";
import { AuthError } from "../../../domain/errors/Autherror";
import dotenv from "dotenv";
import { TOKENS } from "../../../constants/Tokens";

dotenv.config();

@injectable()
export class GoogleAuthUseCase {
  private client: OAuth2Client;

  constructor(
    @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository,
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository
  ) {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async execute(googleToken: string, role: "user" | "driver") {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
 
      const payload = ticket.getPayload();
      if (!payload) throw new AuthError("Invalid Google token", 400);

      const { email, given_name, sub: googleId } = payload;

      if (!email) throw new AuthError("Google account email is required", 400);

      let user;

      if (role === "user") {
        user = await this.userRepository.findByEmail(email);

        if (!user) {
          // Register new user
          user = await this.userRepository.create({
              email,
              name: given_name|| "Google User",
              googleId,
              mobile: "", // Empty string as default
              password: '', // No password for Google users
              profile: "default-profile.png", // Default profile image
              role: "user",
              isBlock:false,
               lastSeen: new Date(),
              onlineStatus: "offline",
             
          });
          
        }
      } else if (role === "driver") {
        user = await this.driverRepository.findByEmail(email);

        if (!user) {
          throw new AuthError("Driver not registered", 401);
        }
      }
      if(!user){
       throw new AuthError ('Not found user ',401)
      }

      const accessToken = AuthService.generateAccessToken({
        id: user._id,
        email: user.email,
        role,
      });

      const refreshToken = AuthService.generateRefreshToken({
        id: user._id,
        email: user.email,
        role,
      });

      return { accessToken, refreshToken,success:true};
    } catch (error) {
      console.error(error);
      throw new AuthError("Google authentication failed", 401);
    }
  }
}
