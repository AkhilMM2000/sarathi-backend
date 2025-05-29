import { inject, injectable } from "tsyringe";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../domain/repositories/IUserepository";
import { IDriverRepository } from "../../domain/repositories/IDriverepository";

import { IRedisrepository } from "../../domain/repositories/IRedisrepository";
import { User } from "../../domain/models/User";
import { Request, Response } from "express";
import dotenv from "dotenv";
import Driverschema from "../../infrastructure/database/modals/Driverschema";
import { AuthService } from "../services/AuthService";
import { AuthError } from "../../domain/errors/Autherror";
import { WalletService } from "../services/WalletService";
import { ReferralCodeService } from "../services/ReferralCodeService";

dotenv.config();
@injectable()
export class VerifyOTP {
  constructor(
    @inject("IUserRepository") private userRepository: IUserRepository,
    @inject("IDriverRepository") private driverRepository: IDriverRepository,
      @inject("UserRegistrationStore") private store: IRedisrepository,
      @inject("WalletService") private walletService:WalletService ,
      @inject("ReferralCodeService") private referralCodeService: ReferralCodeService
  ) {}

  async execute(req: Request, res: Response, email: string, otp: string, role: "user" | "driver") {
 
    const userData = await this.store.getUser(email);

console.log('userData',userData);

    if (!userData) throw new Error("Register again, data not found");
    if (userData.otp !== otp || userData.otpExpires < new Date()) throw new AuthError("Invalid or expired OTP",400);

   

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
        throw new AuthError("A driver with this email, mobile, Aadhaar, or license number already exists.", 409);
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

    res.cookie(`${role}RefreshToken`, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("✅ Tokens generated & refreshToken set in cookies");

    return {
      accessToken,
      user: { id: savedUser._id, role },
    };
  }
}
