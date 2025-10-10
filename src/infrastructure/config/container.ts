import { container } from "tsyringe";
import './useCaseContainer'
import './controllerContainer'
import { IUserRepository } from "../../domain/repositories/IUserepository"; 
import { MongoUserRepository } from "../database/MongoUserRepository";
import { IHashService} from "../../application/services/HashService";
import { EmailService } from "../../application/services/Emailservice"; 
import { IDriverRepository } from "../../domain/repositories/IDriverepository";
import { MongoDriverRepository } from "../database/MongodriverRepository";
import { IFileStorageService } from "../../domain/services/IFileStorageService";
import { CloudinaryFileStorageService } from "../services/cloudstorageservice"; 
import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";
import { MongoVehicleRepository } from "../database/MongoVehicleRepository";
import { RedisUserRegistrationStore } from "../store/UserRegisterStore";
import { IRedisrepository } from "../../domain/repositories/IRedisrepository";
import { GoogleDistanceService } from "../../application/services/GoogleDistanceService";
import { SMSService } from "../../application/services/MSService";
import { TwilioSMSService } from "../services/TwilioSMSService";
import { IBookingRepository } from "../../domain/repositories/IBookingrepository";
import { IFareCalculatorService } from "../../application/services/FareCalculatorService";
import { MongoBookingRepository } from "../database/MongoBookingRepository";
import { FareCalculatorService } from "../services/FareCalculatorService";
import { IStripeAccountService } from "../../application/services/Accountservice";
import { StripeService } from "../services/Accountservice";
import { IStripeService } from "../../domain/services/IStripeService";
import { PaymentService } from "../services/StripeService";
import { IChatRepository } from "../../domain/repositories/IChatRepository";
import { MongoChatRepository } from "../database/ChatRepository";
import { ChatService } from "../../application/services/chatService";
import { IWalletRepository } from "../../domain/repositories/IWalletRepository";
import { MongoWalletRepository } from "../database/WalletRepository";
import { WalletService } from "../../application/services/WalletService";
import { ReferralCodeService } from "../../application/services/ReferralCodeService";
import { INotificationService } from "../../application/services/NotificationService";
import { SocketNotificationService } from "../services/SocketNotification";
import { IDriverReviewRepository } from "../../domain/repositories/IDriverReviewRepository";
import { MongoDriverReviewRepository } from "../database/MongoDriverReviewRepository";
import { IRideAssignmentQueue } from "../../domain/services/IRideAssignmentQueue";
import { RideAssignmentQueue } from "../queues/rideAssignmentQueue";
import { IGoogleMapService } from "../../domain/services/IGoogleMapService";
import { GoogleMapService } from "../services/GoogleMapService";
import { TOKENS } from "../../constants/Tokens";
import { BcryptHashService } from "../services/Hashservice";

// Register repositories
container.registerSingleton<IUserRepository>(TOKENS.IUSER_REPO,  MongoUserRepository );
container.registerSingleton<IDriverRepository>(TOKENS.IDRIVER_REPO,MongoDriverRepository )
container.registerSingleton<IVehicleRepository>(TOKENS.VEHICLE_REPO,MongoVehicleRepository)
container.register<IBookingRepository>("IBookingRepository",{ useClass: MongoBookingRepository });
// Register servicesimplements 
container.registerSingleton<IHashService>(TOKENS.HASH_SERVICE,BcryptHashService );
container.registerSingleton<EmailService>(TOKENS.EMAIL_SERVICE,  EmailService );
container.registerSingleton<WalletService >(TOKENS.WALLET_SERVICE, WalletService );
container.register(TOKENS.REFERAL_CODE_SERVICE, {
  useClass: ReferralCodeService,
});


container.registerSingleton<IFileStorageService>("IFileStorageService",  CloudinaryFileStorageService)

container.registerSingleton<IRedisrepository>(
         TOKENS.USER_REGISTERSTORE,
    RedisUserRegistrationStore
  );
  container.registerSingleton<GoogleDistanceService>(TOKENS.GOOGLE_DISTANCE_SERVICE, GoogleDistanceService);
  container.register<SMSService>("SMSService", { useClass: TwilioSMSService });


  container.register<IFareCalculatorService>("IFareCalculatorService", {
    useClass: FareCalculatorService,
  });

  container.register<IStripeAccountService>('StripeService', {
    useClass: StripeService,
  });
  container.registerSingleton<IStripeService>(TOKENS.PAYMENT_SERVICE,
   PaymentService
  );
  container.register<IChatRepository>("IChatRepository", {
    useClass: MongoChatRepository,
  });
  container.registerSingleton<ChatService>(ChatService);

  //wallet service
  container.registerSingleton<IWalletRepository>(TOKENS.WALLET_REPO,
    MongoWalletRepository,  
  );

  container.register<INotificationService>("INotificationService", {
    useClass: SocketNotificationService,
  });

  //user rate Driver
  container.registerSingleton<IDriverReviewRepository>(
  TOKENS.DRIVER_REVIEW_REPO,
  MongoDriverReviewRepository
);
 
container.registerSingleton<IRideAssignmentQueue>('IRideAssignmentQueue', RideAssignmentQueue);

container.register<IGoogleMapService>('IGoogleMapService', {
  useClass: GoogleMapService,
});

