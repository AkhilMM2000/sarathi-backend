"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const Tokens_1 = require("../../constants/Tokens");
const RegisterUser_1 = require("../../application/use_cases/User/RegisterUser");
const GetUserData_1 = require("../../application/use_cases/User/GetUserData");
const VerifyOTP_1 = require("../../application/use_cases/VerifyOTP");
const ResendOTP_1 = require("../../application/use_cases/ResendOTP");
tsyringe_1.container.registerSingleton(Tokens_1.TOKENS.REGISTER_USER_USECASE, RegisterUser_1.RegisterUser);
tsyringe_1.container.registerSingleton(Tokens_1.TOKENS.GET_USER_DATA_USECASE, GetUserData_1.GetUserData);
tsyringe_1.container.registerSingleton(Tokens_1.TOKENS.VERIFY_OTP_USECAE, VerifyOTP_1.VerifyOTP);
tsyringe_1.container.registerSingleton(Tokens_1.TOKENS.RESEND_OTP_USECASE, ResendOTP_1.ResendOTP);
//# sourceMappingURL=useCaseContainer.js.map