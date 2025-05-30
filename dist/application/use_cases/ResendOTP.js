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
exports.ResendOTP = void 0;
const tsyringe_1 = require("tsyringe");
const Emailservice_1 = require("../services/Emailservice");
let ResendOTP = class ResendOTP {
    constructor(emailService, store) {
        this.emailService = emailService;
        this.store = store;
    }
    async execute(email, role) {
        const existingUser = await this.store.getUser(email);
        if (!existingUser) {
            throw new Error("No pending registration found. Please sign up again.");
        }
        // Generate new OTP
        const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 min
        // // Update the OTP in store
        this.store.addUser(existingUser.email, { ...existingUser, otp: newOTP, otpExpires });
        // Send OTP via email
        await this.emailService.sendOTP(email, newOTP);
        return { message: "OTP resent successfully" };
    }
};
exports.ResendOTP = ResendOTP;
exports.ResendOTP = ResendOTP = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("EmailService")),
    __param(1, (0, tsyringe_1.inject)("UserRegistrationStore")),
    __metadata("design:paramtypes", [Emailservice_1.EmailService, Object])
], ResendOTP);
//# sourceMappingURL=ResendOTP.js.map