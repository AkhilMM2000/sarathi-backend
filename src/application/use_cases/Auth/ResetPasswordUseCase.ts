import bcrypt from 'bcryptjs';
import { inject, injectable } from 'tsyringe';
import { IRedisrepository } from '../../../domain/repositories/IRedisrepository';
import { IUserRepository } from '../../../domain/repositories/IUserepository';
import { IDriverRepository } from '../../../domain/repositories/IDriverepository';
import { AuthError } from '../../../domain/errors/Autherror';

@injectable()
export class ResetPasswordUseCase {
  constructor(
    @inject('UserRegistrationStore') private store: IRedisrepository,
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IDriverRepository') private driverRepository: IDriverRepository,
    
  ) {}

  async execute(token: string, newPassword: string, role: 'user' | 'driver') {
    
    const userId = await this.store.getTokenUser(role, token);
    console.log(userId);
    
    if (!userId) throw new AuthError('Invalid or expired token', 400);
   
 
    let user;
    if (role === 'user') {
      user = await this.userRepository.getUserById(userId);
      if (!user) throw new AuthError('User not found', 404);
    } else if (role === 'driver') {
      user = await this.driverRepository.findDriverById(userId);
      if (!user) throw new AuthError('Driver not found', 404);
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

      return { message: `${role}Password reset successful` };
    } else {
      throw new AuthError('User not found', 404);
    }
  }

}