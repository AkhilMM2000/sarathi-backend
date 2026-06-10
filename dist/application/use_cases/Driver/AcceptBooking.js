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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptBooking = void 0;
const tsyringe_1 = require("tsyringe");
const Booking_1 = require("../../../domain/models/Booking");
const Autherror_1 = require("../../../domain/errors/Autherror");
const Tokens_1 = require("../../../constants/Tokens");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
const Bookingschema_1 = __importDefault(require("../../../infrastructure/database/modals/Bookingschema"));
const mongoose_1 = require("mongoose");
let AcceptBooking = class AcceptBooking {
    constructor(_bookingRepo, _notificationService) {
        this._bookingRepo = _bookingRepo;
        this._notificationService = _notificationService;
    }
    async execute(data) {
        const { bookingId, driverId } = data;
        // Atomic update: only updates status to CONFIRMED if status is currently PENDING
        const updatedBooking = await Bookingschema_1.default.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(bookingId), status: Booking_1.BookingStatus.PENDING }, { status: Booking_1.BookingStatus.CONFIRMED, driverId: new mongoose_1.Types.ObjectId(driverId) }, { new: true }).populate("driverId", "name profileImage mobile");
        // If updatedBooking is null, it was either already accepted or expired
        if (!updatedBooking) {
            throw new Autherror_1.AuthError("This booking request is no longer available.", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
        }
        const driverObj = updatedBooking.driverId;
        // Notify user via Socket.IO
        await this._notificationService.sendBookingConfirmation(updatedBooking.userId.toString(), {
            bookingId: updatedBooking._id.toString(),
            status: Booking_1.BookingStatus.CONFIRMED,
            driver: driverObj ? {
                _id: driverObj._id.toString(),
                name: driverObj.name,
                mobile: driverObj.mobile,
                profileImage: driverObj.profileImage || "N/A"
            } : undefined
        });
        // Notify other online drivers to dismiss their popups
        this._notificationService.bookingAssignedNotification(updatedBooking._id.toString(), driverId);
        return updatedBooking.toObject();
    }
};
exports.AcceptBooking = AcceptBooking;
exports.AcceptBooking = AcceptBooking = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IBOOKING_REPO)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.NOTIFICATION_SERVICE)),
    __metadata("design:paramtypes", [Object, Object])
], AcceptBooking);
//# sourceMappingURL=AcceptBooking.js.map