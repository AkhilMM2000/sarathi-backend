
import { inject, injectable } from 'tsyringe';
import { IRedisrepository } from '../../../domain/repositories/IRedisrepository';
import { IUserRepository } from '../../../domain/repositories/IUserepository';
import { IDriverRepository } from '../../../domain/repositories/IDriverepository';
import { AuthError } from '../../../domain/errors/Autherror';
import { TOKENS } from '../../../constants/Tokens';
import { HTTP_STATUS_CODES } from '../../../constants/HttpStatusCode';
import { ERROR_MESSAGES } from '../../../constants/ErrorMessages';
import { IResetPasswordUseCase } from './interface/IResetPasswordUseCase';

@injectable()
export class ResetPasswordUseCase implements  IResetPasswordUseCase {
  constructor(
    @inject(TOKENS.USER_REGISTERSTORE) private store: IRedisrepository,
    @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository,
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository,
    
  ) {}

  async execute(token: string, newPassword: string, role: 'user' | 'driver'):Promise<void> {
    
    const userId = await this.store.getTokenUser(role, token);
 
    
    if (!userId) throw new AuthError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS_CODES.BAD_REQUEST);
   
 
    let user;
    if (role === 'user') {
      user = await this.userRepository.getUserById(userId);
      if (!user) throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    } else if (role === 'driver') {
      user = await this.driverRepository.findDriverById(userId);
      if (!user) throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }

   
    if (user) {
      
     

      const updatedData = {
        password: newPassword,
        
      };
     

      if (role === 'user') {
        if (user._id) {
        await this.userRepository.updateUser(user._id.toString(), updatedData);
  
        }
      } else if (role === 'driver') {
        if (user._id ) {
          await this.driverRepository.update(user._id.toString(), updatedData);
        }
      }

  
      // Remove token from Redis after successful password reset
      await this.store.removeTokenUser(role, token);

      
    } else {
      throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }
  }

}