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
exports.WalletPayment = void 0;
const Autherror_1 = require("../../../domain/errors/Autherror");
const tsyringe_1 = require("tsyringe");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
const Booking_1 = require("../../../domain/models/Booking");
let WalletPayment = class WalletPayment {
    constructor(walletRepository, bookingRepo, stripeService, driverRepository) {
        this.walletRepository = walletRepository;
        this.bookingRepo = bookingRepo;
        this.stripeService = stripeService;
        this.driverRepository = driverRepository;
    }
    async WalletRidePayment(rideId, userId, amount) {
        try {
            const Payment = {
                paymentStatus: Booking_1.paymentStatus.COMPLETED,
            };
            const Ride = await this.bookingRepo.findBookingById(rideId);
            const driver = await this.driverRepository.findDriverById(Ride?.driverId.toString());
            if (!Ride) {
                throw new Autherror_1.AuthError("Ride not found", HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            if (!driver?.stripeAccountId) {
                throw new Autherror_1.AuthError("stripe connected account not found", HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            //  await this.stripeService.transferToDriverFromWallet(
            //         Ride?.driverId.toString(),
            //         amount,
            //         driver?.stripeAccountId
            //       );
            await this.bookingRepo.updateBooking(rideId, { ...Payment, walletDeduction: amount, driver_fee: Math.floor(amount * 0.9) });
            await this.walletRepository.debitAmount(userId, amount, `ride on ${Ride?.startDate}`);
        }
        catch (error) {
            throw new Autherror_1.AuthError("Failed to do ride wallet payment " + error.message, HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.WalletPayment = WalletPayment;
exports.WalletPayment = WalletPayment = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IWalletRepository")),
    __param(1, (0, tsyringe_1.inject)("IBookingRepository")),
    __param(2, (0, tsyringe_1.inject)("StripePaymentService")),
    __param(3, (0, tsyringe_1.inject)("IDriverRepository")),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], WalletPayment);
//# sourceMappingURL=WalletRidePayment.js.map