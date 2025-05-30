"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const MongoUserRepository_1 = require("../database/MongoUserRepository");
const HashService_1 = require("../../application/services/HashService");
const Emailservice_1 = require("../../application/services/Emailservice");
const MongodriverRepository_1 = require("../database/MongodriverRepository");
const cloudstorageservice_1 = require("../services/cloudstorageservice");
const MongoVehicleRepository_1 = require("../database/MongoVehicleRepository");
const UserRegisterStore_1 = require("../store/UserRegisterStore");
const GoogleDistanceService_1 = require("../../application/services/GoogleDistanceService");
const TwilioSMSService_1 = require("../services/TwilioSMSService");
const MongoBookingRepository_1 = require("../database/MongoBookingRepository");
const FareCalculatorService_1 = require("../services/FareCalculatorService");
const Accountservice_1 = require("../services/Accountservice");
const StripeService_1 = require("../services/StripeService");
const ChatRepository_1 = require("../database/ChatRepository");
const chatService_1 = require("../../application/services/chatService");
const WalletRepository_1 = require("../database/WalletRepository");
const WalletService_1 = require("../../application/services/WalletService");
const ReferralCodeService_1 = require("../../application/services/ReferralCodeService");
const SocketNotification_1 = require("../services/SocketNotification");
const MongoDriverReviewRepository_1 = require("../database/MongoDriverReviewRepository");
// Register repositories
tsyringe_1.container.register("IUserRepository", { useClass: MongoUserRepository_1.MongoUserRepository });
tsyringe_1.container.register("IDriverRepository", { useClass: MongodriverRepository_1.MongoDriverRepository });
tsyringe_1.container.register("IVehicleRepository", { useClass: MongoVehicleRepository_1.MongoVehicleRepository });
tsyringe_1.container.register("IBookingRepository", { useClass: MongoBookingRepository_1.MongoBookingRepository });
// Register services
tsyringe_1.container.register("HashService", { useClass: HashService_1.HashService });
tsyringe_1.container.register("EmailService", { useClass: Emailservice_1.EmailService });
tsyringe_1.container.register("WalletService", { useClass: WalletService_1.WalletService });
tsyringe_1.container.register("ReferralCodeService", {
    useClass: ReferralCodeService_1.ReferralCodeService,
});
tsyringe_1.container.registerSingleton("IFileStorageService", cloudstorageservice_1.CloudinaryFileStorageService);
tsyringe_1.container.registerSingleton("UserRegistrationStore", UserRegisterStore_1.RedisUserRegistrationStore);
tsyringe_1.container.registerSingleton("GoogleDistanceService", GoogleDistanceService_1.GoogleDistanceService);
tsyringe_1.container.register("SMSService", { useClass: TwilioSMSService_1.TwilioSMSService });
tsyringe_1.container.register("IFareCalculatorService", {
    useClass: FareCalculatorService_1.FareCalculatorService,
});
tsyringe_1.container.register('StripeService', {
    useClass: Accountservice_1.StripeService,
});
tsyringe_1.container.register('StripePaymentService', {
    useClass: StripeService_1.PaymentService
});
tsyringe_1.container.register("IChatRepository", {
    useClass: ChatRepository_1.MongoChatRepository,
});
tsyringe_1.container.registerSingleton(chatService_1.ChatService);
//wallet service
tsyringe_1.container.register("IWalletRepository", {
    useClass: WalletRepository_1.MongoWalletRepository,
});
tsyringe_1.container.register("INotificationService", {
    useClass: SocketNotification_1.SocketNotificationService,
});
//user rate Driver
tsyringe_1.container.registerSingleton('DriverReviewRepository', MongoDriverReviewRepository_1.MongoDriverReviewRepository);
//# sourceMappingURL=container.js.map