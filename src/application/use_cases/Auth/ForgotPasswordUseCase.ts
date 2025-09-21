import { v4 as uuidv4 } from 'uuid';

import { IUserRepository } from '../../../domain/repositories/IUserepository';
import { AuthError } from '../../../domain/errors/Autherror'; 
import { inject, injectable } from 'tsyringe';
import { IRedisrepository } from '../../../domain/repositories/IRedisrepository';
import { IDriverRepository } from '../../../domain/repositories/IDriverepository';
import { EmailService } from '../../services/Emailservice';
import { TOKENS } from '../../../constants/Tokens';
@injectable()
export class ForgotPasswordUseCase {
  constructor(
    @inject(TOKENS.USER_REGISTERSTORE) private store: IRedisrepository,
    @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository,
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository,
    @inject(TOKENS.EMAIL_SERVICE) private emailService: EmailService,
  ) {}

  async execute(email: string,role:'user'|'driver') {
    let user;
    console.log(email,role);
    
    if(role=='user'){
     user= await this.userRepository.findByEmail(email);
    if (!user) throw new AuthError('User not found', 404);
    }
    if(role=='driver'){
        user= await this.driverRepository.findByEmail(email);
       
        
    if (!user) throw new AuthError('Driver not found', 404); 
    }

    // Generate token
    const token = uuidv4();
   
    if (user?._id)   this.store.addTokenUser(role, token, user._id.toString()); 
     
     
      

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&role=${role}`;

    console.log(resetLink);

    // Send reset email
    // Use Nodemailer or similar service
     if(user?.email)   await this.emailService.sendForgotPasswordLink(user?.email,resetLink)
 

    return{
       
        message:`check ${role} mail for reset password`
    }
  }
}
