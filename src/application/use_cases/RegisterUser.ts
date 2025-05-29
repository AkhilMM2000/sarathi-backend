import { inject, injectable } from "tsyringe";
import { EmailService } from "../services/Emailservice"; 
import { IRedisrepository } from "../../domain/repositories/IRedisrepository";
import { User } from "../../domain/models/User";
import { AuthError } from "../../domain/errors/Autherror";
import { IUserRepository } from "../../domain/repositories/IUserepository";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
@injectable()
export class RegisterUser {
  constructor(
    @inject("EmailService") private emailService: EmailService,
    @inject("UserRegistrationStore") private store: IRedisrepository,
      @inject("IUserRepository") private userRepository: IUserRepository,
) {}

  async execute(userData: User) {
    const { name, email, mobile, password, referralCode } = userData;
   
   const CheckExistingUser = await this.userRepository.findByEmailOrMobile(email,mobile);
   console.log(CheckExistingUser,'check user');
   if(CheckExistingUser) {
     throw new AuthError("User already exists with this email or mobile", HTTP_STATUS_CODES.CONFLICT);
     
   }
   
    // Check if user already exists in memory (to prevent resending OTP)
    if (await this.store.getUser(email)) {
      await this.store.removeUser(email)
      //  throw new AuthError("OTP already sent to this email", 429);
  }
  
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store user data temporarily
    await this.store.addUser(email, { name, email, mobile, password, referralCode, otp, otpExpires });
// console.log(await this.store.getUser(email),'for user');

    // Send OTP to email
    await this.emailService.sendOTP(email, otp);
    console.log(otp,'this is your register otp')

    return { message: "OTP sent to email" };
  }
  
}
