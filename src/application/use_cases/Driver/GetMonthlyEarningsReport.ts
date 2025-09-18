import { inject, injectable } from 'tsyringe';
import { IBookingRepository } from '../../../domain/repositories/IBookingrepository'; 
import { HTTP_STATUS_CODES } from '../../../constants/HttpStatusCode';
import { AuthError } from '../../../domain/errors/Autherror';
import { ERROR_MESSAGES } from '../../../constants/ErrorMessages';

@injectable()
export class GetDriverEarningsSummary {
  constructor(
    @inject('IBookingRepository')
    private bookingRepo: IBookingRepository
  ) {}

    async execute(driverId: string, year: number, month?: number) {
    try {
      return await this.bookingRepo.getDriverEarningsByMonth(driverId, year, month);
    } catch (error: any) {
      console.error('GetDriverEarningsSummary Use Case Error:', error.message);
      throw new AuthError(ERROR_MESSAGES.BOOKING_EARNINGS_SUMMARY_NOT_FOUND, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}
