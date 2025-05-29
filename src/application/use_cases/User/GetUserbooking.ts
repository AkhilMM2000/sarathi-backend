import { inject, injectable } from "tsyringe";
import { BookingWithUsername, IBookingRepository, PaginatedResult } from "../../../domain/repositories/IBookingrepository"; 
import { Booking } from "../../../domain/models/Booking"; 

@injectable()
export class GetUserBookings {
  constructor(
    @inject("IBookingRepository")
    private bookingRepo: IBookingRepository
  ) {}

  async execute(userId: string, page: number = 1, limit: number = 2): Promise<PaginatedResult<BookingWithUsername>> {
    return await this.bookingRepo.findBookingsByUser(userId, page, limit);
  }
}
