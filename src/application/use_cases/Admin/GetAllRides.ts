import { inject, injectable } from "tsyringe";
import { BookingWithUsername, IBookingRepository, PaginatedResult } from "../../../domain/repositories/IBookingrepository"; 
import { TOKENS } from "../../../constants/Tokens";
import { IGetAllBookingsUseCase } from "./Interfaces/IGetAllBookingsUseCase";

@injectable()
export class GetAllBookings implements IGetAllBookingsUseCase {
  constructor(
    @inject(TOKENS.IBOOKING_REPO)
    private bookingRepo: IBookingRepository
  ) {}

  async execute( page: number = 1, limit: number = 3): Promise<PaginatedResult<BookingWithUsername>>{
    return await this.bookingRepo.GetAllBookings( page, limit);
  }

}
