
import { inject, injectable } from 'tsyringe';
import { IBookingRepository } from '../../../domain/repositories/IBookingrepository'; 
import { TOKENS } from '../../../constants/Tokens';

@injectable()
export class GetBookingStatusSummary {
  constructor(
    @inject(TOKENS.IBOOKING_REPO)
    private bookingRepo: IBookingRepository
  ) {}

  async execute(driverId: string, year?: number, month?: number): Promise<Record<string, number>> {
   
      return await this.bookingRepo.countBookingsByStatus(driverId, year, month);
   
  }
}
