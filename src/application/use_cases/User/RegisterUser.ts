import { inject, injectable } from "tsyringe";
import { EmailService } from "../../services/Emailservice"; 
import { IRedisrepository } from "../../../domain/repositories/IRedisrepository";
import { User } from "../../../domain/models/User";
import { AuthError } from "../../../domain/errors/Autherror";
import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { TOKENS } from "../../../constants/Tokens";
import { IRegisterUser } from "./interfaces/IRegisterUser";
import { INFO_MESSAGES } from "../../../constants/Info_Messages";
@injectable()
export class RegisterUser implements IRegisterUser {
  constructor(
    @inject(TOKENS.EMAIL_SERVICE) private emailService: EmailService,
    @inject(TOKENS.USER_REGISTERSTORE) private store: IRedisrepository,
      @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository,
) {}

  async execute(userData: User):Promise<{ message: string }>  {
    const { name, email, mobile, password, referralCode } = userData;
   
   const CheckExistingUser = await this.userRepository.findByEmailOrMobile(email,mobile);

   if(CheckExistingUser) {
     throw new AuthError(ERROR_MESSAGES.EMAIL_OR_MOBILE_EXIST, HTTP_STATUS_CODES.CONFLICT);
     
   }
   
 
    if (await this.store.getUser(email)) {
      await this.store.removeUser(email)
   
  }
  
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await this.store.addUser(email, { name, email, mobile, password, referralCode, otp, otpExpires });
 console.log(otp,'ypur otp')
    await this.emailService.sendOTP(email, otp);
    

    return { message: INFO_MESSAGES.USER.OTP };
  }
  
}
