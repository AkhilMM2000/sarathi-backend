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
exports.RegisterUser = void 0;
const tsyringe_1 = require("tsyringe");
const Emailservice_1 = require("../../services/Emailservice");
const Autherror_1 = require("../../../domain/errors/Autherror");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
const ErrorMessages_1 = require("../../../constants/ErrorMessages");
const Tokens_1 = require("../../../constants/Tokens");
const Info_Messages_1 = require("../../../constants/Info_Messages");
let RegisterUser = class RegisterUser {
    constructor(emailService, store, userRepository) {
        this.emailService = emailService;
        this.store = store;
        this.userRepository = userRepository;
    }
    async execute(userData) {
        const { name, email, mobile, password, referralCode } = userData;
        const CheckExistingUser = await this.userRepository.findByEmailOrMobile(email, mobile);
        if (CheckExistingUser) {
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.EMAIL_OR_MOBILE_EXIST, HttpStatusCode_1.HTTP_STATUS_CODES.CONFLICT);
        }
        if (await this.store.getUser(email)) {
            await this.store.removeUser(email);
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        await this.store.addUser(email, { name, email, mobile, password, referralCode, otp, otpExpires });
        await this.emailService.sendOTP(email, otp);
        return { message: Info_Messages_1.INFO_MESSAGES.USER.OTP };
    }
};
exports.RegisterUser = RegisterUser;
exports.RegisterUser = RegisterUser = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.EMAIL_SERVICE)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.USER_REGISTERSTORE)),
    __param(2, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IUSER_REPO)),
    __metadata("design:paramtypes", [Emailservice_1.EmailService, Object, Object])
], RegisterUser);
//# sourceMappingURL=RegisterUser.js.map