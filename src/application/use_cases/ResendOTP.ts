import { injectable ,inject} from "tsyringe";

import { IRedisrepository } from "../../domain/repositories/IRedisrepository";
import { EmailService } from "../services/Emailservice"; 

@injectable()
export class ResendOTP {
  constructor(
    @inject("EmailService") private emailService: EmailService,
    @inject("UserRegistrationStore") private store: IRedisrepository
) {}
  async execute(email: string, role: string) {
 
    const existingUser =await this.store.getUser(email);


    if (!existingUser) {
      throw new Error("No pending registration found. Please sign up again.");
    }

    // Generate new OTP
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 min

    // // Update the OTP in store
    this.store.addUser(existingUser.email,{ ...existingUser, otp: newOTP, otpExpires });

    // Send OTP via email
    await this.emailService.sendOTP(email, newOTP);




    return { message: "OTP resent successfully" };
  }
}
