import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository"; 
import { BookingStatus } from "../../../domain/models/Booking";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";
import { TOKENS } from "../../../constants/Tokens";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { ICancelBookingUseCase } from "./interfaces/ICancelBookingUseCase";

interface CancelBookingInput {
  bookingId: string;
  status: BookingStatus;
  reason: string;
}

@injectable()
export class CancelBookingInputUseCase  implements ICancelBookingUseCase{
  constructor(
     @inject(TOKENS.NOTIFICATION_SERVICE)
        private notificationService: INotificationService,
    @inject(TOKENS.IBOOKING_REPO)
    private bookingRepo: IBookingRepository
  ) {}

  async execute(input: CancelBookingInput): Promise<void> {
    const { bookingId, status, reason } = input;

    const booking = await this.bookingRepo.findBookingById(bookingId);
    if (!booking) {
      throw new AuthError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }

    await this.bookingRepo.updateBooking(bookingId, {
      status,
      reason
    });
   await this.notificationService.cancelBookingNotification(booking.driverId.toString(),{status,reason,startDate:booking.startDate,bookingId})
  }
}
