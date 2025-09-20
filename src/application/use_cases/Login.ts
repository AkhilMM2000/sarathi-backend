import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../domain/repositories/IUserepository"; 
import { IDriverRepository } from "../../domain/repositories/IDriverepository";
import bcrypt from "bcryptjs";

import dotenv from "dotenv";
import { User } from "../../domain/models/User";
import { Driver } from "../../domain/models/Driver"
import { AuthService } from "../services/AuthService";
import { AuthError } from "../../domain/errors/Autherror"; 
import { HashService } from "../services/HashService";
import { TOKENS } from "../../constants/Tokens";
dotenv.config();
@injectable()
export class Login {
  constructor(
    @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository,
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository,
 @inject("HashService") private hashService: HashService
  ) {}
  async execute(email: string, password: string, role: "user" | "driver" | "admin") {
    let user: User | Driver | null = null;

   
    if (role === "user" || role === "admin") {
      user = await this.userRepository.findByEmail(email);
        if (!user) {
        throw new AuthError(`${role} not found register as user`, 401);
      }
    } else if (role === "driver") {
      user = await this.driverRepository.findByEmail(email);
      // if (user?.status === "pending") {
      //   throw new AuthError("Your account is under review. Please wait for approval.", 403);
      // }
  
      if (user?.status === "rejected") {
        throw new AuthError("Your registration has been rejected. just clear your verification ", 403);
      }
    }

    if(user?.isBlock){
      throw new AuthError("Your account has been blocked. Please contact support.", 403);
    }
    const status= await this.hashService.compare(password,user?.password||'')
    console.log(status);
    
  if(user){
    (await bcrypt.compare(password,user.password));
  }


    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AuthError("Invalid email or password", 401);
    }

    // Ensure admin users are correctly assigned
    if (role === "user" && user.role === "admin") {
      role = "admin";
    }

    const accessToken = AuthService.generateAccessToken({ id: user._id, email: user.email, role });
    const refreshToken = AuthService.generateRefreshToken({ id: user._id, email: user.email, role });

    return {
      accessToken,
      refreshToken,
      role
    };
  }
}
