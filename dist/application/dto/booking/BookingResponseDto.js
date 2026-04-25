"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRideHistoryListResponse = exports.toRideHistoryResponse = void 0;
/**
 * Mapper: Repository Result -> RideHistoryResponseDto
 */
const toRideHistoryResponse = (booking) => {
    return {
        _id: booking.id || booking._id?.toString() || "",
        userId: booking.userId.toString(),
        driverId: booking.driverId.toString(),
        fromLocation: booking.fromLocation || "",
        toLocation: booking.toLocation || "",
        startDate: booking.startDate instanceof Date ? booking.startDate.toISOString() : String(booking.startDate),
        endDate: booking.endDate ? (booking.endDate instanceof Date ? booking.endDate.toISOString() : String(booking.endDate)) : undefined,
        estimatedKm: booking.estimatedKm || 0,
        finalFare: booking.finalFare || 0,
        bookingType: booking.bookingType,
        status: booking.status || "PENDING",
        paymentStatus: booking.paymentStatus || "PENDING",
        name: booking.name || "",
        email: booking.email || "",
        profile: booking.profile || "",
        place: booking.place || "",
        mobile: booking.mobile
    };
};
exports.toRideHistoryResponse = toRideHistoryResponse;
/**
 * Mapper: Array of Repository Results -> Array of RideHistoryResponseDto
 */
const toRideHistoryListResponse = (bookings) => {
    return bookings.map(exports.toRideHistoryResponse);
};
exports.toRideHistoryListResponse = toRideHistoryListResponse;
//# sourceMappingURL=BookingResponseDto.js.map