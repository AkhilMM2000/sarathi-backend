"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../../domain/errors/Autherror");
let ResetPasswordUseCase = class ResetPasswordUseCase {
    constructor(store, userRepository, driverRepository) {
        this.store = store;
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
    }
    async execute(token, newPassword, role) {
        const userId = await this.store.getTokenUser(role, token);
        console.log(userId);
        if (!userId)
            throw new Autherror_1.AuthError('Invalid or expired token', 400);
        let user;
        if (role === 'user') {
            user = await this.userRepository.getUserById(userId);
            if (!user)
                throw new Autherror_1.AuthError('User not found', 404);
        }
        else if (role === 'driver') {
            user = await this.driverRepository.findDriverById(userId);
            if (!user)
                throw new Autherror_1.AuthError('Driver not found', 404);
        }
        if (user) {
            const updatedData = {
                password: newPassword,
            };
            if (role === 'user') {
                if (user._id) {
                    await this.userRepository.updateUser(user._id.toString(), updatedData);
                }
            }
            else if (role === 'driver') {
                if (user._id) {
                    await this.driverRepository.update(user._id.toString(), updatedData);
                }
            }
            // Remove token from Redis after successful password reset
            await this.store.removeTokenUser(role, token);
            return { message: `${role}Password reset successful` };
        }
        else {
            throw new Autherror_1.AuthError('User not found', 404);
        }
    }
};
exports.ResetPasswordUseCase = ResetPasswordUseCase;
exports.ResetPasswordUseCase = ResetPasswordUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('UserRegistrationStore')),
    __param(1, (0, tsyringe_1.inject)('IUserRepository')),
    __param(2, (0, tsyringe_1.inject)('IDriverRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], ResetPasswordUseCase);
//# sourceMappingURL=ResetPasswordUseCase.js.map