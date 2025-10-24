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
import { IWalletTransaction } from "../../application/use_cases/User/interfaces/IWalletTransaction";
import { WalletTransactionUseCase } from "../../application/use_cases/User/walletTransaction";
import { ISubmitDriverReview } from "../../application/use_cases/User/interfaces/ISubmitDriverReview";
import { SubmitDriverReview } from "../../application/use_cases/User/SubmitRating";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { IRegisterDriverUseCase } from "../../application/use_cases/Driver/interfaces/IRegisterDriverUseCase";
import { RegisterDriver } from "../../application/use_cases/Driver/RegisterDriver";
import { EditDriverProfile } from "../../application/use_cases/Driver/EditDriverProfile";
import { IEditDriverProfile } from "../../application/use_cases/Driver/interfaces/IEditDriverProfile";
import { IOnboardDriverUseCase } from "../../application/use_cases/Driver/interfaces/IOnboardDriverUseCase";
import { OnboardDriverUseCase } from "../../application/use_cases/Driver/DriverOnboarding";
import { IGetBooking } from "../../application/use_cases/Driver/interfaces/IGetUserBooking";
import { GetUserBookings } from "../../application/use_cases/Driver/Getdriverbooking";
import { IVerifyDriverPaymentAccount } from "../../application/use_cases/Driver/interfaces/IVerifyDriverPaymentAccount";
import { VerifyDriverPaymentAccount } from "../../application/use_cases/Driver/VerifyAccountStatus";
import { IBookDriverUseCase } from "../../application/use_cases/User/interfaces/IBookDriverUseCase";
import { BookDriver } from "../../application/use_cases/User/BookDriver";

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
container.registerSingleton<IWalletTransaction>(
  TOKENS.WALLET_TRANSACTION_USECASE,
  WalletTransactionUseCase
);

container.registerSingleton<ISubmitDriverReview>(
TOKENS.SUBMIT_REVIEW_USECASE,
SubmitDriverReview 
)

container.registerSingleton<IRegisterDriverUseCase>(
  USECASE_TOKENS.REGISTER_DRIVER_USECASE,
  RegisterDriver

)
container.registerSingleton<IEditDriverProfile>(USECASE_TOKENS.EDIT_DRIVER_PROFILE,
 EditDriverProfile);
 container.registerSingleton<IOnboardDriverUseCase>(
  USECASE_TOKENS.ONBOARD_DRIVER_USECASE,
   OnboardDriverUseCase 
);

container.registerSingleton<IGetBooking>(USECASE_TOKENS.GET_USERBOOKINGS_USECASE,GetUserBookings )
container.registerSingleton<IVerifyDriverPaymentAccount>(
  USECASE_TOKENS.VERIFY_DRIVER_PAYMENT_ACCOUNT_USECASE,
   VerifyDriverPaymentAccount
);
container.registerSingleton<IBookDriverUseCase>(
 USECASE_TOKENS.BOOK_DRIVER_USECASE,
  BookDriver
);