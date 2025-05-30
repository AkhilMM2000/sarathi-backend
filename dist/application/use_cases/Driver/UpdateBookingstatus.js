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
exports.UpdateBookingStatus = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../../domain/errors/Autherror");
let UpdateBookingStatus = class UpdateBookingStatus {
    constructor(bookingRepo, notificationService) {
        this.bookingRepo = bookingRepo;
        this.notificationService = notificationService;
    }
    async execute(input) {
        const { bookingId, status, reason, finalKm } = input;
        let finalFare = undefined;
        const booking = await this.bookingRepo.findBookingById(bookingId);
        if (!booking) {
            throw new Autherror_1.AuthError("Booking not found", 404);
        }
        if (status === "REJECTED" && !reason) {
            throw new Autherror_1.AuthError("Reason is required when rejecting a booking.", 400);
        }
        // If ride is completed and finalKm is provided, calculate final fare
        if (status === "COMPLETED") {
            if (finalKm === undefined || finalKm === null) {
                console.log(0);
                throw new Autherror_1.AuthError("Final KM is required to complete the ride", 400);
            }
            const estimated = booking.estimatedFare || 0;
            const ratePerKm = 10;
            finalFare = estimated + finalKm * ratePerKm;
        }
        if (status === "REJECTED" && reason) {
            this.notificationService.rejectBookingNotification(booking.userId.toString(), { status, startDate: booking.startDate, bookingId, reason });
        }
        // Always update status, and optionally finalFare and reason
        await this.bookingRepo.updateBooking(bookingId, {
            status,
            ...(reason && { reason }),
            ...(finalFare !== undefined && { finalFare }),
        });
        this.notificationService.sendBookingConfirmation(booking.userId.toString(), { status, startDate: booking.startDate, bookingId });
    }
};
exports.UpdateBookingStatus = UpdateBookingStatus;
exports.UpdateBookingStatus = UpdateBookingStatus = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IBookingRepository")),
    __param(1, (0, tsyringe_1.inject)("INotificationService")),
    __metadata("design:paramtypes", [Object, Object])
], UpdateBookingStatus);
//# sourceMappingURL=UpdateBookingstatus.js.map