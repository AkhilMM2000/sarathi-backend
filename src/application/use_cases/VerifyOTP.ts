import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../domain/repositories/IUserepository";
import { IDriverRepository } from "../../domain/repositories/IDriverepository";
import { IRedisrepository } from "../../domain/repositories/IRedisrepository";
import dotenv from "dotenv";
import Driverschema from "../../infrastructure/database/modals/Driverschema";
import { AuthService } from "../services/AuthService";
import { AuthError } from "../../domain/errors/Autherror";
import { WalletService } from "../services/WalletService";
import { ReferralCodeService } from "../services/ReferralCodeService";
import { TOKENS } from "../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { VerifyOtpResponseDto } from "./Data_transerObj/VerifyOtpResponseDto";
import { IVerifyOtp } from "./Interfaces/IVerifyOtp";
dotenv.config();
@injectable()
export class VerifyOTP implements IVerifyOtp {
  constructor(
    @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository,
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository,
      @inject(TOKENS.USER_REGISTERSTORE) private store: IRedisrepository,
      @inject(TOKENS.WALLET_SERVICE) private walletService:WalletService ,
      @inject(TOKENS.REFERAL_CODE_SERVICE) private referralCodeService: ReferralCodeService
  ) {}

  async execute(email: string, otp: string, role: "user" | "driver"): Promise<VerifyOtpResponseDto> {
 
    const userData = await this.store.getUser(email);

console.log('userData',userData);

    if (!userData)  throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.BAD_REQUEST);
    if (userData.otp !== otp || userData.otpExpires < new Date()) throw new AuthError(ERROR_MESSAGES.OTP_INVALID,HTTP_STATUS_CODES.BAD_REQUEST);

   

    // Choose repository based on role
    const repository = role === "user" ? this.userRepository : this.driverRepository;

    let savedUser;
    if (role === "driver") {
      // Remove unwanted fields before saving
      const { otp, otpExpires, confirmPassword, ...driverData } = userData;
      const existingDriver = await Driverschema.findOne({
        $or: [
          { email: driverData.email },
          { mobile: driverData.mobile },
          { aadhaarNumber: driverData.aadhaarNumber },
          { licenseNumber: driverData.licenseNumber },
        ],
      });
      
      if (existingDriver) {
        console.error("❌ Duplicate driver found:", existingDriver);
        throw new AuthError(ERROR_MESSAGES.ALREDY_EXIST, HTTP_STATUS_CODES.CONFLICT);
      }
      // Ensure necessary fields are set for drivers
      driverData.status = "pending";
      driverData.isBlock = false;
      driverData.role = "driver";

      console.log("📌 Saving driver to DB:", driverData);
      console.log("📝 Required Schema Fields:", Object.keys(Driverschema.schema.paths));
      // Save driver in the database
      savedUser = await repository.create(driverData);
    } else {

      console.log("📌 Saving user to DB:", userData);

      
      if (userData.referralCode) {
        const referalExists = await this.userRepository.findByReferralCode(userData.referralCode);
        if (referalExists) {
          userData.referredBy = referalExists._id;
           userData.referalPay=true

        }
      }
      
     
      savedUser = await repository.create(userData);
      const loggesUser=await this.userRepository.findByEmail(userData.email)
      const code = this.referralCodeService.generate(loggesUser?._id?.toString());
    
      if (loggesUser?._id) {
        await this.userRepository.updateUser(loggesUser._id.toString(), { referralCode: code });
      }
        
      if (savedUser?._id) {
        await this.walletService.createWallet(savedUser._id.toString());
      }

    }

  

    if (!savedUser) console.log('user data doesnt get to you');
    
    console.log("✅ User successfully saved:", savedUser);
    console.log("📝 Required Schema Fields:", Object.keys(Driverschema.schema.paths));
    

    const accessToken = AuthService.generateAccessToken({ id:  savedUser._id, email: savedUser.email, role });
    const refreshToken = AuthService.generateRefreshToken({ id: savedUser._id, email: savedUser.email, role });

      return {
      accessToken,
      refreshToken,
      user: {
        id: savedUser._id ? savedUser._id.toString() : "",
        role,
      },
    };
  }
}
