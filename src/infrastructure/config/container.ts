import { container } from "tsyringe";
import { IUserRepository } from "../../domain/repositories/IUserepository"; 
import { MongoUserRepository } from "../database/MongoUserRepository";
import { HashService} from "../../application/services/HashService";
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

// Register repositories
container.register<IUserRepository>("IUserRepository", { useClass: MongoUserRepository });
container.register<IDriverRepository>("IDriverRepository", { useClass:MongoDriverRepository })
container.register<IVehicleRepository>("IVehicleRepository",{useClass:MongoVehicleRepository})
container.register<IBookingRepository>("IBookingRepository",{ useClass: MongoBookingRepository });
// Register services
container.register<HashService>("HashService", { useClass: HashService });
container.registerSingleton<EmailService>("EmailService",  EmailService );
container.register<WalletService >("WalletService", { useClass: WalletService });
container.register("ReferralCodeService", {
  useClass: ReferralCodeService,
});


container.registerSingleton<IFileStorageService>("IFileStorageService",  CloudinaryFileStorageService)

container.registerSingleton<IRedisrepository>(
    "UserRegistrationStore",
    RedisUserRegistrationStore
  );
  container.registerSingleton<GoogleDistanceService>("GoogleDistanceService", GoogleDistanceService);
  container.register<SMSService>("SMSService", { useClass: TwilioSMSService });


  container.register<IFareCalculatorService>("IFareCalculatorService", {
    useClass: FareCalculatorService,
  });

  container.register<IStripeAccountService>('StripeService', {
    useClass: StripeService,
  });
  container.register<IStripeService>('StripePaymentService', {
    useClass:PaymentService
  });
  container.register<IChatRepository>("IChatRepository", {
    useClass: MongoChatRepository,
  });
  container.registerSingleton<ChatService>(ChatService);

  //wallet service
  container.register<IWalletRepository>("IWalletRepository", {
    useClass: MongoWalletRepository,  
  });

  container.register<INotificationService>("INotificationService", {
    useClass: SocketNotificationService,
  });

  //user rate Driver
  container.registerSingleton<IDriverReviewRepository>(
  'DriverReviewRepository',
  MongoDriverReviewRepository
);
container.registerSingleton<IRideAssignmentQueue>('IRideAssignmentQueue', RideAssignmentQueue);

container.register<IGoogleMapService>('IGoogleMapService', {
  useClass: GoogleMapService,
});

