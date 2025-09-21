"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const tsyringe_1 = require("tsyringe");
const UserController_1 = require("../presentation/controllers/UserController");
exports.userController = tsyringe_1.container.resolve(UserController_1.UserController);
//# sourceMappingURL=controllerResolve.js.map