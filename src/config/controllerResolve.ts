import { container } from 'tsyringe';
import { UserController } from '../presentation/controllers/UserController'; 
import { TOKENS } from '../constants/Tokens';
import { DriverController } from '../presentation/controllers/DriverControler';
import { USECASE_TOKENS } from '../constants/UseCaseTokens';


export const userController = container.resolve<UserController>(TOKENS.USER_CONTROLLER);
export const driverController=container.resolve<DriverController>(USECASE_TOKENS.DRIVER_CONTROLLER)