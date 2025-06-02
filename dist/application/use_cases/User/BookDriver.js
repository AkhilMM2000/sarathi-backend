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
exports.BookDriver = void 0;
const tsyringe_1 = require("tsyringe");
const Booking_1 = require("../../../domain/models/Booking");
const mongoose_1 = require("mongoose");
const Autherror_1 = require("../../../domain/errors/Autherror");
let BookDriver = class BookDriver {
    constructor(bookingRepo, fareCalculator, notificationService) {
        this.bookingRepo = bookingRepo;
        this.fareCalculator = fareCalculator;
        this.notificationService = notificationService;
    }
    async execute(data) {
        const { driverId, startDate, endDate, bookingType } = data;
        if (endDate && startDate > endDate) {
            throw new Autherror_1.AuthError("End date must be greater than start date", 400);
        }
        // Step 1: Check if driver is already booked in that range
        const isBooked = await this.bookingRepo.checkDriverAvailability(driverId, startDate, endDate);
        console.log(!isBooked);
        if (!isBooked) {
            throw new Autherror_1.AuthError("Driver is already booked for the selected time.", 400);
        }
        //
        const estimatedFare = this.fareCalculator.calculate({
            bookingType,
            estimatedKm: data.estimatedKm,
            startDate,
            endDate,
        });
        const newBooking = {
            ...data,
            userId: new mongoose_1.Types.ObjectId(data.userId),
            driverId: new mongoose_1.Types.ObjectId(data.driverId),
            estimatedFare,
            status: Booking_1.BookingStatus.PENDING,
            paymentMode: "stripe",
        };
        // Step 4: Save booking
        const savedBooking = await this.bookingRepo.createBooking(newBooking);
        await this.notificationService.sendBookingNotification(driverId, { startDate, newRide: savedBooking });
        return savedBooking;
    }
};
exports.BookDriver = BookDriver;
exports.BookDriver = BookDriver = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IBookingRepository")),
    __param(1, (0, tsyringe_1.inject)("IFareCalculatorService")),
    __param(2, (0, tsyringe_1.inject)("INotificationService")),
    __metadata("design:paramtypes", [Object, Object, Object])
], BookDriver);
//# sourceMappingURL=BookDriver.js.map