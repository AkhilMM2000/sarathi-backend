import { container } from 'tsyringe';
import { UserController } from '../presentation/controllers/UserController'; 
import { TOKENS } from '../constants/Tokens';

export const userController = container.resolve<UserController>(TOKENS.USER_CONTROLLER);
