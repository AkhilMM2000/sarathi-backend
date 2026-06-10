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
const Tokens_1 = require("../../../constants/Tokens");
const GoogleDistanceService_1 = require("../../services/GoogleDistanceService");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
let BookDriver = class BookDriver {
    constructor(_bookingRepo, _driverRepo, _fareCalculator, _notificationService, _distanceService) {
        this._bookingRepo = _bookingRepo;
        this._driverRepo = _driverRepo;
        this._fareCalculator = _fareCalculator;
        this._notificationService = _notificationService;
        this._distanceService = _distanceService;
    }
    async execute(data) {
        const { driverId, startDate, endDate, bookingType } = data;
        if (endDate && startDate > endDate) {
            throw new Autherror_1.AuthError("End date must be greater than start date", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
        }
        // Check availability only if a specific driver was requested
        if (driverId) {
            const isBooked = await this._bookingRepo.checkDriverAvailability(driverId, startDate, endDate);
            if (!isBooked) {
                throw new Autherror_1.AuthError("Driver is already booked for the selected time.", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
        }
        const estimatedFare = this._fareCalculator.calculate({
            bookingType,
            estimatedKm: data.estimatedKm,
            startDate,
            endDate,
        });
        let targetedDriverIds = [];
        if (!driverId) {
            // 1. Find all approved, active-payment drivers within 30km straight-line radius
            console.log(data.fromLat, data.fromLng, "fromLat,fromLng");
            const nearbyDrivers = await this._driverRepo.findNearbyDriversWithinRadius({ latitude: data.fromLat, longitude: data.fromLng }, [], 30 // 30 km straight-line radius
            );
            console.log(nearbyDrivers, "nearbyDrivers");
            // 2. Query Google Maps Distance API to filter by road distance
            const driverLocations = nearbyDrivers.map((d) => ({
                id: d._id.toString(),
                latitude: d.latitude,
                longitude: d.longitude,
            }));
            if (driverLocations.length > 0) {
                const distances = await this._distanceService.getDistances({ latitude: data.fromLat, longitude: data.fromLng }, driverLocations);
                // 3. Keep only drivers whose road distance is <= 20 km
                targetedDriverIds = nearbyDrivers
                    .filter((d) => {
                    const roadDist = distances[d._id.toString()];
                    console.log(`[Matchmaking Filter] Driver ${d._id} road distance: ${roadDist} km`);
                    return roadDist !== undefined && roadDist <= 20; // 20 km road distance limit
                })
                    .map((d) => d._id.toString());
                console.log("🎯 final targetedDriverIds within 20km:", targetedDriverIds);
            }
            // If there are no drivers within 20km road distance, throw error
            if (targetedDriverIds.length === 0) {
                throw new Autherror_1.AuthError("No drivers available within 20km road distance from your pickup location.", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
        }
        const newBooking = {
            userId: new mongoose_1.Types.ObjectId(data.userId),
            ...(driverId && { driverId: new mongoose_1.Types.ObjectId(driverId) }),
            fromLocation: data.fromLocation,
            toLocation: data.toLocation,
            startDate: new Date(startDate),
            ...(endDate && { endDate: new Date(endDate) }),
            estimatedKm: data.estimatedKm,
            bookingType,
            estimatedFare,
            status: Booking_1.BookingStatus.PENDING,
            paymentMode: "stripe",
            fromLat: data.fromLat,
            fromLng: data.fromLng,
        };
        // Save booking
        const savedBooking = await this._bookingRepo.createBooking(newBooking);
        if (savedBooking.driverId) {
            await this._notificationService.sendBookingNotification(savedBooking.driverId.toString(), {
                bookingId: savedBooking._id?.toString() || savedBooking.id || "",
                fromLocation: savedBooking.fromLocation,
                toLocation: savedBooking.toLocation,
                estimatedFare: savedBooking.estimatedFare,
                startDate,
                newRide: savedBooking
            });
        }
        else {
            await this._notificationService.broadcastBookingNotification(targetedDriverIds, {
                bookingId: savedBooking._id?.toString() || savedBooking.id || "",
                fromLocation: savedBooking.fromLocation,
                toLocation: savedBooking.toLocation,
                estimatedFare: savedBooking.estimatedFare,
                startDate,
                newRide: savedBooking
            });
        }
        return savedBooking;
    }
};
exports.BookDriver = BookDriver;
exports.BookDriver = BookDriver = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IBOOKING_REPO)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __param(2, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IFARE_CALCULATE_SERVICE)),
    __param(3, (0, tsyringe_1.inject)(Tokens_1.TOKENS.NOTIFICATION_SERVICE)),
    __param(4, (0, tsyringe_1.inject)(Tokens_1.TOKENS.GOOGLE_DISTANCE_SERVICE)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, GoogleDistanceService_1.GoogleDistanceService])
], BookDriver);
//# sourceMappingURL=BookDriver.js.map