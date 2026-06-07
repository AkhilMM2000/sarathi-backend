import { container } from "tsyringe";
import BookingModel from "../database/modals/Bookingschema";
import { BookingStatus } from "../../domain/models/Booking";
import { INotificationService } from "../../application/services/NotificationService";
import { TOKENS } from "../../constants/Tokens";

export class CronScheduler {
  static start() {
    console.log("[CronScheduler] Booking expiration scheduler started.");
    
    // Check every 1 minute
    setInterval(async () => {
      try {
        const expirationTime = new Date(Date.now() - 30 * 60 * 1000);
        
        // Find all pending bookings created more than 30 minutes ago
        const expiredBookings = await BookingModel.find({
          status: BookingStatus.PENDING,
          createdAt: { $lt: expirationTime }
        });

        if (expiredBookings.length === 0) return;

        const notificationService = container.resolve<INotificationService>(TOKENS.NOTIFICATION_SERVICE);

        for (const booking of expiredBookings) {
          booking.status = BookingStatus.CANCELLED;
          booking.reason = "No driver accepted the request within 30 minutes.";
          await booking.save();

          // Notify the user
          await notificationService.rejectBookingNotification(booking.userId.toString(), {
            bookingId: (booking._id as any).toString(),
            status: BookingStatus.CANCELLED,
            startDate: booking.startDate,
            reason: booking.reason
          });

          // Dismiss request popup for all online drivers
          notificationService.bookingAssignedNotification((booking._id as any).toString());
        }

        console.log(`[CronScheduler] Expired ${expiredBookings.length} pending booking(s).`);
      } catch (error) {
        console.error("[CronScheduler] Error running expiration cron:", error);
      }
    }, 60 * 1000);
  }
}
