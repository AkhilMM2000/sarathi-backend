import { container } from "tsyringe";
import { IRegisterUser } from "../../application/use_cases/User/interfaces/IRegisterUser";
import { TOKENS } from "../../constants/Tokens";
import { RegisterUser } from "../../application/use_cases/User/RegisterUser";
import { IGetUserData } from "../../application/use_cases/User/interfaces/IGetUserData";
import { GetUserData } from "../../application/use_cases/User/GetUserData";
import { IVerifyOtp } from "../../application/use_cases/Interfaces/IVerifyOtp";
import { VerifyOTP } from "../../application/use_cases/VerifyOTP";

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