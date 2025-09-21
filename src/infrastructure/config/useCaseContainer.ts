import { container } from "tsyringe";
import { IRegisterUser } from "../../application/use_cases/User/interfaces/IRegisterUser";
import { TOKENS } from "../../constants/Tokens";
import { RegisterUser } from "../../application/use_cases/User/RegisterUser";
import { IGetUserData } from "../../application/use_cases/User/interfaces/IGetUserData";
import { GetUserData } from "../../application/use_cases/User/GetUserData";
import { IVerifyOtp } from "../../application/use_cases/Interfaces/IVerifyOtp";
import { VerifyOTP } from "../../application/use_cases/VerifyOTP";
import { IResendOTP } from "../../application/use_cases/Interfaces/IResendOTP";
import { ResendOTP } from "../../application/use_cases/ResendOTP";
import { Login } from "../../application/use_cases/Login";
import { ILogin } from "../../application/use_cases/Interfaces/ILogin";

container.registerSingleton<IRegisterUser>(
  TOKENS.REGISTER_USER_USECASE,
  RegisterUser 
);

container.registerSingleton<IGetUserData>(
TOKENS.GET_USER_DATA_USECASE,
GetUserData
)
 
container.registerSingleton<IVerifyOtp>(
TOKENS.VERIFY_OTP_USECAE,
VerifyOTP
)
container.registerSingleton<IResendOTP>(TOKENS.RESEND_OTP_USECASE, ResendOTP);
container.registerSingleton<ILogin>(TOKENS.LOGIN_USECASE, Login);