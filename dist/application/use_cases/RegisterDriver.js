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
exports.RegisterDriver = void 0;
const tsyringe_1 = require("tsyringe");
const Emailservice_1 = require("../services/Emailservice");
const crypto_1 = require("crypto");
const Tokens_1 = require("../../constants/Tokens");
let RegisterDriver = class RegisterDriver {
    constructor(emailService, store) {
        this.emailService = emailService;
        this.store = store;
    }
    async execute(driverData) {
        const { email } = driverData;
        console.log(driverData);
        // if (await this.store.getUser(email)) throw new Error("OTP already sent to this email");
        const otp = (0, crypto_1.randomInt)(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        //store the data in the js map
        await this.store.addUser(email, { ...driverData, otp, otpExpires });
        console.log(driverData);
        // Send OTP to driver's email
        await this.emailService.sendOTP(email, otp);
        return { message: "OTP sent successfully. Please verify your email." };
    }
};
exports.RegisterDriver = RegisterDriver;
exports.RegisterDriver = RegisterDriver = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.EMAIL_SERVICE)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.USER_REGISTERSTORE)),
    __metadata("design:paramtypes", [Emailservice_1.EmailService, Object])
], RegisterDriver);
//# sourceMappingURL=RegisterDriver.js.map