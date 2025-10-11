import { container } from "tsyringe";
import { UserController } from "../../presentation/controllers/UserController";
import { TOKENS } from "../../constants/Tokens";
import { DriverController } from "../../presentation/controllers/DriverControler";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";

container.registerSingleton<UserController>(TOKENS.USER_CONTROLLER, UserController);
container.registerSingleton<DriverController>(USECASE_TOKENS.DRIVER_CONTROLLER,DriverController)