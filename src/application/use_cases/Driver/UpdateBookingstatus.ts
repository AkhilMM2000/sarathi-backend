import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository"; 
import { BookingStatus } from "../../../domain/models/Booking";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";
import { TOKENS } from "../../../constants/Tokens";

interface UpdateBookingStatusInput {
  bookingId: string;
  status: BookingStatus
  reason?: string;
  finalKm?: number;
}
@injectable()
export class UpdateBookingStatus {
  constructor(  @inject(TOKENS.IBOOKING_REPO)
  private bookingRepo: IBookingRepository,
 @inject("INotificationService")
    private notificationService: INotificationService
) {}

  async execute(input: UpdateBookingStatusInput): Promise<void> {
    const { bookingId, status, reason, finalKm } = input;
    let finalFare: number | undefined = undefined;

    const booking = await this.bookingRepo.findBookingById(bookingId);
    
    if (!booking) {
      throw new AuthError("Booking not found", 404);
    }

    if (status === "REJECTED" && !reason) {
      throw new AuthError(
        "Reason is required when rejecting a booking.",
        400
      );
    }

    // If ride is completed and finalKm is provided, calculate final fare
    if (status === "COMPLETED") {
      if (finalKm === undefined || finalKm === null) {
        console.log(0)
        throw new AuthError("Final KM is required to complete the ride", 400);
      }

      const estimated = booking.estimatedFare || 0;
      const ratePerKm = 10;

      finalFare = estimated + finalKm * ratePerKm;
    }
    if (status === "REJECTED" && reason){
      this.notificationService.rejectBookingNotification(booking.userId.toString(),{status,startDate:booking.startDate,bookingId,reason})
    }
    // Always update status, and optionally finalFare and reason
    await this.bookingRepo.updateBooking(bookingId, {
      status,
      ...(reason && { reason }),
      ...(finalFare !== undefined && { finalFare }),
    });
    this.notificationService.sendBookingConfirmation(booking.userId.toString(),{status,startDate:booking.startDate,bookingId});

    
  }
 

}