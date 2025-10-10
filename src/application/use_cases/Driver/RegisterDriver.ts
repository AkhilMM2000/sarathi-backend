import { inject, injectable } from "tsyringe";
import { EmailService } from "../../services/Emailservice"; 
import { IRedisrepository } from "../../../domain/repositories/IRedisrepository"; 
import { randomInt } from "crypto";
import { Driver } from "../../../domain/models/Driver";
import { TOKENS } from "../../../constants/Tokens";
import { AuthError } from "../../../domain/errors/Autherror";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
@injectable()
export class RegisterDriver {
  constructor(
    @inject(TOKENS.EMAIL_SERVICE) private emailService: EmailService,
    @inject(TOKENS.USER_REGISTERSTORE) private store: IRedisrepository
  ) {}

  async execute(driverData:Driver ) {
    const { email } = driverData;

   console.log(driverData);
   
    if (await this.store.getUser(email)) throw new AuthError("OTP already sent to this email",HTTP_STATUS_CODES.CONFLICT);
 
    const otp = randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
    //store the data in the js map
    await this.store.addUser(email,{...driverData,otp,otpExpires})
    console.log(driverData);
    
    
    // Send OTP to driver's email
    await this.emailService.sendOTP(email, otp);
  
  
    return { message: "OTP sent successfully. Please verify your email." };
  }

  
}

