import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository"; 
import { Booking } from "../../../domain/models/Booking"; 

@injectable()
export class GetUserBookings {
  constructor(
    @inject("IBookingRepository")
    private bookingRepo: IBookingRepository
  ) {}

  async execute(userId: string, page: number = 1, limit: number = 3): Promise<Booking[]> {
    return await this.bookingRepo.findBookingsByUser(userId, page, limit);
  }

}
