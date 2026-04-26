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
const Tokens_1 = require("../../../constants/Tokens");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
const ErrorMessages_1 = require("../../../constants/ErrorMessages");
let AttachPaymentIntentIdToBooking = class AttachPaymentIntentIdToBooking {
    constructor(_bookingRepo, _walletRepository, _userRepository, _stripeService, _notificationService) {
        this._bookingRepo = _bookingRepo;
        this._walletRepository = _walletRepository;
        this._userRepository = _userRepository;
        this._stripeService = _stripeService;
        this._notificationService = _notificationService;
    }
    async execute(params) {
        const { rideId, walletDeduction, paymentIntentId, paymentStatus: paymentstatus, userId } = params;
        const booking = await this._bookingRepo.findBookingById(rideId);
        console.log(walletDeduction, 'walletDeduction');
        if (!booking) {
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.BOOKING_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
        }
        if (walletDeduction && walletDeduction > 0) {
            await this._walletRepository.debitAmount(booking.userId.toString(), walletDeduction, `ride booked for ${booking.startDate}`);
            booking.walletDeduction = walletDeduction;
        }
        if (paymentIntentId) {
            booking.paymentIntentId = paymentIntentId;
        }
        if (paymentstatus) {
            booking.paymentStatus = paymentstatus;
        }
        if (paymentstatus && paymentIntentId) {
            const payment = await this._stripeService.retrievePaymentIntent(paymentIntentId);
            booking.driver_fee = (payment.amount - payment.application_fee_amount) * .01;
            booking.platform_fee = payment.application_fee_amount * .01;
        }
        if (paymentstatus == 'COMPLETED' && userId) {
            const user = await this._userRepository.getUserById(userId);
            if (!user) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
        }
        await this._bookingRepo.updateBooking(rideId, booking);
        console.log(booking.driverId.toString());
        if (paymentstatus == 'COMPLETED') {
            await this._notificationService.paymentNotification(booking.driverId.toString(), { status: paymentstatus, startDate: booking.startDate, bookingId: rideId });
        }
    }
};
exports.AttachPaymentIntentIdToBooking = AttachPaymentIntentIdToBooking;
exports.AttachPaymentIntentIdToBooking = AttachPaymentIntentIdToBooking = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IBOOKING_REPO)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.WALLET_REPO)),
    __param(2, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IUSER_REPO)),
    __param(3, (0, tsyringe_1.inject)(Tokens_1.TOKENS.PAYMENT_SERVICE)),
    __param(4, (0, tsyringe_1.inject)(Tokens_1.TOKENS.NOTIFICATION_SERVICE)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], AttachPaymentIntentIdToBooking);
//# sourceMappingURL=AttachPaymentIntentIdToBooking.js.map