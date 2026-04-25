"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverStatsQuerySchema = exports.DriverReviewParamsSchema = exports.WalletPaymentSchema = exports.GetChatSignatureSchema = exports.RideHistorySchema = exports.BookingIdParamSchema = exports.RideIdParamSchema = exports.AttachPaymentIntentSchema = exports.UserBookingPaginationSchema = exports.GetEstimatedFareSchema = exports.UpdateBookingStatusSchema = exports.MessageParamsSchema = exports.ChatParamsSchema = exports.CancelBookingSchema = exports.BookDriverSchema = void 0;
const zod_1 = require("zod");
const Booking_1 = require("../../../domain/models/Booking");
/**
 * Book Driver Request Schema
 * Handles validation and date coercion for the initial booking request
 */
exports.BookDriverSchema = zod_1.z.object({
    driverId: zod_1.z.string().min(1, "Driver ID is required"),
    fromLocation: zod_1.z.string().min(1, "From location is required"),
    toLocation: zod_1.z.string().optional(),
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date().optional(),
    estimatedKm: zod_1.z.coerce.number().nonnegative().optional(),
    bookingType: zod_1.z.nativeEnum(Booking_1.BookingType),
}).refine((data) => {
    if (data.endDate && data.startDate > data.endDate) {
        return false;
    }
    return true;
}, {
    message: "End date must be after start date",
    path: ["endDate"],
});
/**
 * Cancel Booking Request Schema
 */
exports.CancelBookingSchema = zod_1.z.object({
    bookingId: zod_1.z.string().min(1, "Booking ID is required"),
    reason: zod_1.z.string().min(1, "Reason is required"),
});
/**
 * Chat Params Schema
 */
exports.ChatParamsSchema = zod_1.z.object({
    roomId: zod_1.z.string().min(1, "Room ID is required"),
});
/**
 * Message Params Schema
 */
exports.MessageParamsSchema = exports.ChatParamsSchema.extend({
    messageId: zod_1.z.string().min(1, "Message ID is required"),
});
/**
 * Update Booking Status Schema
 */
exports.UpdateBookingStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(Booking_1.BookingStatus),
    reason: zod_1.z.string().optional(),
    finalKm: zod_1.z.coerce.number().nonnegative().optional(),
}).refine((data) => {
    if (data.status === Booking_1.BookingStatus.REJECTED && !data.reason) {
        return false;
    }
    return true;
}, {
    message: "Reason is required when rejecting a booking",
    path: ["reason"],
}).refine((data) => {
    if (data.status === Booking_1.BookingStatus.COMPLETED && data.finalKm === undefined) {
        return false;
    }
    return true;
}, {
    message: "Final KM is required when completing a booking",
    path: ["finalKm"],
});
/**
 * Get Estimated Fare Request Schema
 */
exports.GetEstimatedFareSchema = zod_1.z.object({
    bookingType: zod_1.z.nativeEnum(Booking_1.BookingType),
    estimatedKm: zod_1.z.coerce.number().nonnegative().optional(),
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date().optional(),
});
/**
 * Helper to ensure query params are single values even if multiple are sent
 */
const coerceToSingle = (val) => (Array.isArray(val) ? val[0] : val);
/**
 * User Booking Pagination Schema (Query Params)
 */
exports.UserBookingPaginationSchema = zod_1.z.object({
    page: zod_1.z.preprocess(coerceToSingle, zod_1.z.coerce.number().min(1).default(1)),
    limit: zod_1.z.preprocess(coerceToSingle, zod_1.z.coerce.number().min(1).max(50).default(10)),
});
/**
 * Attach Payment Intent Schema
 */
exports.AttachPaymentIntentSchema = zod_1.z.object({
    paymentIntentId: zod_1.z.string().min(1, "Payment Intent ID is required"),
    paymentStatus: zod_1.z.string().optional(),
    walletDeduction: zod_1.z.coerce.number().nonnegative().optional().default(0),
});
/**
 * Ride ID Params Schema
 */
exports.RideIdParamSchema = zod_1.z.object({
    rideId: zod_1.z.string().min(1, "Ride ID is required"),
});
/**
 * Booking ID Params Schema
 */
exports.BookingIdParamSchema = zod_1.z.object({
    bookingId: zod_1.z.string().min(1, "Booking ID is required"),
});
/**
 * Ride History Pagination Schema
 */
exports.RideHistorySchema = exports.UserBookingPaginationSchema;
/**
 * Chat Signature Request Schema
 */
exports.GetChatSignatureSchema = zod_1.z.object({
    fileType: zod_1.z.string().min(1, "File type is required"),
});
/**
 * Wallet Payment Request Schema
 */
exports.WalletPaymentSchema = zod_1.z.object({
    rideId: zod_1.z.string().min(1, "Ride ID is required"),
    amount: zod_1.z.coerce.number().positive("Amount must be positive"),
});
/**
 * Driver Review Params Schema (from id param)
 */
exports.DriverReviewParamsSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "Driver ID is required"),
});
/**
 * Driver Stats Query Schema (year/month)
 */
exports.DriverStatsQuerySchema = zod_1.z.object({
    year: zod_1.z.preprocess(coerceToSingle, zod_1.z.coerce.number().int().min(2020).optional()),
    month: zod_1.z.preprocess(coerceToSingle, zod_1.z.coerce.number().int().min(1).max(12).optional()),
});
//# sourceMappingURL=BookingRequestDTO.js.map