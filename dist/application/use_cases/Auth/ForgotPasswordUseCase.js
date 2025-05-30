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
exports.ForgotPasswordUseCase = void 0;
const uuid_1 = require("uuid");
const Autherror_1 = require("../../../domain/errors/Autherror");
const tsyringe_1 = require("tsyringe");
const Emailservice_1 = require("../../services/Emailservice");
let ForgotPasswordUseCase = class ForgotPasswordUseCase {
    constructor(store, userRepository, driverRepository, emailService) {
        this.store = store;
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.emailService = emailService;
    }
    async execute(email, role) {
        let user;
        console.log(email, role);
        if (role == 'user') {
            user = await this.userRepository.findByEmail(email);
            if (!user)
                throw new Autherror_1.AuthError('User not found', 404);
        }
        if (role == 'driver') {
            user = await this.driverRepository.findByEmail(email);
            if (!user)
                throw new Autherror_1.AuthError('Driver not found', 404);
        }
        // Generate token
        const token = (0, uuid_1.v4)();
        if (user?._id)
            this.store.addTokenUser(role, token, user._id.toString());
        // Create reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&role=${role}`;
        console.log(resetLink);
        // Send reset email
        // Use Nodemailer or similar service
        if (user?.email)
            await this.emailService.sendForgotPasswordLink(user?.email, resetLink);
        return {
            message: `check ${role} mail for reset password`
        };
    }
};
exports.ForgotPasswordUseCase = ForgotPasswordUseCase;
exports.ForgotPasswordUseCase = ForgotPasswordUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("UserRegistrationStore")),
    __param(1, (0, tsyringe_1.inject)("IUserRepository")),
    __param(2, (0, tsyringe_1.inject)("IDriverRepository")),
    __param(3, (0, tsyringe_1.inject)("EmailService")),
    __metadata("design:paramtypes", [Object, Object, Object, Emailservice_1.EmailService])
], ForgotPasswordUseCase);
//# sourceMappingURL=ForgotPasswordUseCase.js.map