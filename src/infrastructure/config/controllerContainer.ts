import { container } from "tsyringe";
import { UserController } from "../../presentation/controllers/UserController";
import { TOKENS } from "../../constants/Tokens";

container.registerSingleton<UserController>(TOKENS.USER_CONTROLLER, UserController);