import { inject, injectable } from "tsyringe";
import { IBookingRepository, rideHistory } from "../../../domain/repositories/IBookingrepository";
import { BookingWithUsername } from "../../../domain/repositories/IBookingrepository";
import { PaginatedResult } from "../../../domain/repositories/IBookingrepository";
import { TOKENS } from "../../../constants/Tokens";
import { IGetBooking } from "./interfaces/IGetUserBooking";

@injectable()
export class GetUserBookings implements IGetBooking {
  constructor(
    @inject(TOKENS.IBOOKING_REPO)
    private bookingRepo: IBookingRepository
  ) {}

  async execute(driverId: string, page: number = 1, limit: number = 2): Promise<PaginatedResult<rideHistory>> {
   
    return await this.bookingRepo.findBookingsByDriver(driverId, page, limit);
  }
}

