import { inject, injectable } from 'tsyringe';
import { IBookingRepository } from '../../../domain/repositories/IBookingrepository'; 
import { TOKENS } from '../../../constants/Tokens';
import { IGetDriverEarningsSummaryUseCase } from './interfaces/IGetDriverEarningsSummaryUseCase';

@injectable()
export class GetDriverEarningsSummary implements IGetDriverEarningsSummaryUseCase {
  constructor(
    @inject(TOKENS.IBOOKING_REPO)
    private bookingRepo: IBookingRepository
  ) {}

    async execute(driverId: string, year: number, month?: number):Promise<{
    chartData: { label: string; totalEarnings: number }[];
    totalEarnings: number;
    totalRides: number;
  }> {
   
      return await this.bookingRepo.getDriverEarningsByMonth(driverId, year, month);
    
  }
}
