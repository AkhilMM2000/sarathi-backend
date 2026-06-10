"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronScheduler = void 0;
const tsyringe_1 = require("tsyringe");
const Bookingschema_1 = __importDefault(require("../database/modals/Bookingschema"));
const Booking_1 = require("../../domain/models/Booking");
const Tokens_1 = require("../../constants/Tokens");
class CronScheduler {
    static start() {
        console.log("[CronScheduler] Booking expiration scheduler started.");
        // Check every 30 seconds to catch expired bookings promptly
        setInterval(async () => {
            try {
                const limitMinutes = parseInt(process.env.BOOKING_EXPIRATION_LIMIT_MINUTES || "3", 10);
                const expirationTime = new Date(Date.now() - limitMinutes * 60 * 1000);
                // Find all pending bookings created more than the limit time ago
                const expiredBookings = await Bookingschema_1.default.find({
                    status: Booking_1.BookingStatus.PENDING,
                    createdAt: { $lt: expirationTime }
                });
                if (expiredBookings.length === 0)
                    return;
                const notificationService = tsyringe_1.container.resolve(Tokens_1.TOKENS.NOTIFICATION_SERVICE);
                for (const booking of expiredBookings) {
                    booking.status = Booking_1.BookingStatus.EXPIRED;
                    booking.reason = `No driver accepted the request within ${limitMinutes} minutes.`;
                    await booking.save();
                    // 1. Notify the user
                    notificationService.rejectBookingNotification(booking.userId.toString(), {
                        bookingId: booking._id.toString(),
                        status: Booking_1.BookingStatus.EXPIRED,
                        startDate: booking.startDate,
                        reason: booking.reason
                    });
                    // 2. Dismiss request popup for all online drivers
                    notificationService.bookingAssignedNotification(booking._id.toString());
                }
                console.log(`[CronScheduler] Expired ${expiredBookings.length} pending booking(s).`);
            }
            catch (error) {
                console.error("[CronScheduler] Error running expiration cron:", error);
            }
        }, 30 * 1000);
    }
}
exports.CronScheduler = CronScheduler;
//# sourceMappingURL=CronScheduler.js.map