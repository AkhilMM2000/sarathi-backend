"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FareCalculatorService = void 0;
const tsyringe_1 = require("tsyringe");
const Booking_1 = require("../../domain/models/Booking");
const Autherror_1 = require("../../domain/errors/Autherror");
let FareCalculatorService = class FareCalculatorService {
    constructor() {
        this.PER_KM_RATE = 10; // move to env/config later
        this.PER_DAY_RATE = 1000;
    }
    calculate(params) {
        const { bookingType, estimatedKm, startDate, endDate } = params;
        let fare = 0;
        console.log(params);
        if (bookingType === Booking_1.BookingType.ONE_WAY) {
            if (!estimatedKm)
                throw new Error("Estimated KM is required for ONE_WAY booking");
            fare = estimatedKm * this.PER_KM_RATE;
            return fare < 450 ? 450 : fare;
        }
        if (bookingType === Booking_1.BookingType.ROUND_TRIP) {
            if (!endDate)
                throw new Error("End date is required for ROUND_TRIP booking");
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime();
            const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return dayCount * this.PER_DAY_RATE;
        }
        throw new Autherror_1.AuthError("Invalid booking type", 400);
    }
};
exports.FareCalculatorService = FareCalculatorService;
exports.FareCalculatorService = FareCalculatorService = __decorate([
    (0, tsyringe_1.injectable)()
], FareCalculatorService);
//# sourceMappingURL=FareCalculatorService.js.map