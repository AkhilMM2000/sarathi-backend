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
exports.AttachPaymentIntentIdToBooking = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../../domain/errors/Autherror");
let AttachPaymentIntentIdToBooking = class AttachPaymentIntentIdToBooking {
    constructor(bookingRepo, walletRepository, userRepository, stripeService, notificationService) {
        this.bookingRepo = bookingRepo;
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.stripeService = stripeService;
        this.notificationService = notificationService;
    }
    async execute(bookingId, walletDeduction, paymentIntentId, paymentstatus, userId) {
        const booking = await this.bookingRepo.findBookingById(bookingId);
        console.log(walletDeduction, 'walletDeduction');
        if (!booking) {
            throw new Autherror_1.AuthError('Booking not found', 404);
        }
        if (walletDeduction && walletDeduction > 0) {
            await this.walletRepository.debitAmount(booking.userId.toString(), walletDeduction, `ride booked for ${booking.startDate}`);
            booking.walletDeduction = walletDeduction;
        }
        if (paymentIntentId) {
            booking.paymentIntentId = paymentIntentId;
        }
        if (paymentstatus) {
            booking.paymentStatus = paymentstatus;
        }
        if (paymentstatus && paymentIntentId) {
            const payment = await this.stripeService.retrievePaymentIntent(paymentIntentId);
            booking.driver_fee = (payment.amount - payment.application_fee_amount) * .01;
            booking.platform_fee = payment.application_fee_amount * .01;
        }
        if (paymentstatus == 'COMPLETED' && userId) {
            const user = await this.userRepository.getUserById(userId);
            if (!user) {
                throw new Autherror_1.AuthError('User not found', 404);
            }
        }
        await this.bookingRepo.updateBooking(bookingId, booking);
        console.log(booking.driverId.toString());
        if (paymentstatus == 'COMPLETED') {
            await this.notificationService.paymentNotification(booking.driverId.toString(), { status: paymentstatus, startDate: booking.startDate, bookingId });
        }
    }
};
exports.AttachPaymentIntentIdToBooking = AttachPaymentIntentIdToBooking;
exports.AttachPaymentIntentIdToBooking = AttachPaymentIntentIdToBooking = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IBookingRepository")),
    __param(1, (0, tsyringe_1.inject)("IWalletRepository")),
    __param(2, (0, tsyringe_1.inject)("IUserRepository")),
    __param(3, (0, tsyringe_1.inject)('StripePaymentService')),
    __param(4, (0, tsyringe_1.inject)("INotificationService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], AttachPaymentIntentIdToBooking);
//# sourceMappingURL=AttachPaymentIntentIdToBooking.js.map