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
exports.CancelBookingInputUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const Booking_1 = require("../../../domain/models/Booking");
const Autherror_1 = require("../../../domain/errors/Autherror");
const Tokens_1 = require("../../../constants/Tokens");
const ErrorMessages_1 = require("../../../constants/ErrorMessages");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
let CancelBookingInputUseCase = class CancelBookingInputUseCase {
    constructor(_notificationService, _bookingRepo) {
        this._notificationService = _notificationService;
        this._bookingRepo = _bookingRepo;
    }
    async execute(input) {
        const { bookingId, status, reason } = input;
        const booking = await this._bookingRepo.findBookingById(bookingId);
        if (!booking) {
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.BOOKING_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
        }
        // Only restrict cancellation if the booking is already CONFIRMED (assigned to a driver)
        if (booking.status === Booking_1.BookingStatus.CONFIRMED) {
            const IST_OFFSET = 5.5 * 60 * 60 * 1000;
            const startIST = new Date(new Date(booking.startDate).getTime() + IST_OFFSET);
            const cutoffIST = new Date(startIST);
            cutoffIST.setUTCDate(cutoffIST.getUTCDate() - 1);
            cutoffIST.setUTCHours(21, 0, 0, 0); // 9:00 PM IST
            const cutoffTime = cutoffIST.getTime() - IST_OFFSET;
            if (Date.now() > cutoffTime) {
                throw new Autherror_1.AuthError("Bookings can only be cancelled before 9:00 PM of the day before the ride.", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
        }
        await this._bookingRepo.updateBooking(bookingId, {
            status,
            reason
        });
        if (booking.driverId) {
            await this._notificationService.cancelBookingNotification(booking.driverId.toString(), { status, reason, startDate: booking.startDate, bookingId });
        }
    }
};
exports.CancelBookingInputUseCase = CancelBookingInputUseCase;
exports.CancelBookingInputUseCase = CancelBookingInputUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.NOTIFICATION_SERVICE)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IBOOKING_REPO)),
    __metadata("design:paramtypes", [Object, Object])
], CancelBookingInputUseCase);
//# sourceMappingURL=CancelBooking.js.map