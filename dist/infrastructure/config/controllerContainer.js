"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const UserController_1 = require("../../presentation/controllers/UserController");
const Tokens_1 = require("../../constants/Tokens");
const DriverControler_1 = require("../../presentation/controllers/DriverControler");
const UseCaseTokens_1 = require("../../constants/UseCaseTokens");
const BookingController_1 = require("../../presentation/controllers/BookingController");
const AdminController_1 = require("../../presentation/controllers/AdminController");
const AuthController_1 = require("../../presentation/controllers/AuthController");
tsyringe_1.container.registerSingleton(Tokens_1.TOKENS.USER_CONTROLLER, UserController_1.UserController);
tsyringe_1.container.registerSingleton(UseCaseTokens_1.USECASE_TOKENS.DRIVER_CONTROLLER, DriverControler_1.DriverController);
tsyringe_1.container.registerSingleton(Tokens_1.TOKENS.BOOKING_CONTROLLER, BookingController_1.BookingController);
tsyringe_1.container.registerSingleton(Tokens_1.TOKENS.ADMIN_CONTROLLER, AdminController_1.AdminController);
tsyringe_1.container.registerSingleton(Tokens_1.TOKENS.AUTH_CONTROLLER, AuthController_1.AuthController);
//# sourceMappingURL=controllerContainer.js.map