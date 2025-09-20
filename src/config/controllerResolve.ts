import { container } from 'tsyringe';
import { UserController } from '../presentation/controllers/UserController'; 

export const userController = container.resolve(UserController);
