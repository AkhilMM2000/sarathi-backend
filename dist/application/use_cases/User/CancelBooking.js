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
const Autherror_1 = require("../../../domain/errors/Autherror");
let CancelBookingInputUseCase = class CancelBookingInputUseCase {
    constructor(notificationService, bookingRepo) {
        this.notificationService = notificationService;
        this.bookingRepo = bookingRepo;
    }
    async execute(input) {
        const { bookingId, status, reason } = input;
        const booking = await this.bookingRepo.findBookingById(bookingId);
        if (!booking) {
            throw new Autherror_1.AuthError("Booking not found", 404);
        }
        await this.bookingRepo.updateBooking(bookingId, {
            status,
            reason
        });
        this.notificationService.cancelBookingNotification(booking.driverId.toString(), { status, reason, startDate: booking.startDate, bookingId });
    }
};
exports.CancelBookingInputUseCase = CancelBookingInputUseCase;
exports.CancelBookingInputUseCase = CancelBookingInputUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("INotificationService")),
    __param(1, (0, tsyringe_1.inject)("IBookingRepository")),
    __metadata("design:paramtypes", [Object, Object])
], CancelBookingInputUseCase);
//# sourceMappingURL=CancelBooking.js.map