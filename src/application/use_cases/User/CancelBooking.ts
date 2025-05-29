import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository"; 
import { BookingStatus } from "../../../domain/models/Booking";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";

interface CancelBookingInput {
  bookingId: string;
  status: BookingStatus;
  reason: string;
}

@injectable()
export class CancelBookingInputUseCase {
  constructor(
     @inject("INotificationService")
        private notificationService: INotificationService,
    @inject("IBookingRepository")
    private bookingRepo: IBookingRepository
  ) {}

  async execute(input: CancelBookingInput): Promise<void> {
    const { bookingId, status, reason } = input;

    const booking = await this.bookingRepo.findBookingById(bookingId);
    if (!booking) {
      throw new AuthError("Booking not found", 404);
    }

    await this.bookingRepo.updateBooking(bookingId, {
      status,
      reason
    });
    this.notificationService.cancelBookingNotification(booking.driverId.toString(),{status,reason,startDate:booking.startDate,bookingId})
  }
}
