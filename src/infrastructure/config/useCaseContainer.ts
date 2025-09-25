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
import { IAddVehicleUseCase } from "../../application/use_cases/Interfaces/IAddvehicle";
import { AddVehicle } from "../../application/use_cases/User/AddVehicle";
import { IEditVehicleUseCase } from "../../application/use_cases/User/interfaces/IEditVehicleUseCase";
import { EditVehicle } from "../../application/use_cases/User/EditVehicle";
import { IGetVehiclesByUserUseCase } from "../../application/use_cases/User/interfaces/IGetVehiclesByUserUseCase";
import { GetVehiclesByUser } from "../../application/use_cases/User/GetVehiclesByUser";
import { IUpdateUserData } from "../../application/use_cases/User/interfaces/IUpdateUserData";
import { UpdateUserData } from "../../application/use_cases/User/UpdateUserData";
import { FindNearbyDrivers } from "../../application/use_cases/User/FindNearbyDrivers";
import { ICreatePaymentIntent } from "../../application/use_cases/User/interfaces/ICreatePaymentIntent";
import { CreatePaymentIntent } from "../../application/use_cases/User/CreatePaymentIntent";
import { IGetDriverProfile } from "../../application/use_cases/Driver/interfaces/IGetDriverProfile";
import { GetDriverProfile } from "../../application/use_cases/Driver/Getdriverprofile";

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
container.registerSingleton<IAddVehicleUseCase>(TOKENS.ADD_VEHICLE_USECASE,
  AddVehicle
);
container.registerSingleton<IEditVehicleUseCase>(TOKENS.EDIT_VEHICLE_USECASE, 
 EditVehicle,
);
container.register<IGetVehiclesByUserUseCase>(TOKENS.GET_VEHICLES_BY_USER_USECASE,
   GetVehiclesByUser,
);
container.registerSingleton<IUpdateUserData>(TOKENS.UPDATE_USER_USECASE,
  UpdateUserData,
);
container.registerSingleton<FindNearbyDrivers>(
  TOKENS.FIND_NEARBY_DRIVERS_USECASE,
  FindNearbyDrivers
);
container.registerSingleton<ICreatePaymentIntent>(
  TOKENS.CREATE_PAYMENT_INTENT_USECASE,
  CreatePaymentIntent
);
container.registerSingleton<IGetDriverProfile>(
  TOKENS.GET_DRIVER_PROFILE_USECASE,
  GetDriverProfile
);