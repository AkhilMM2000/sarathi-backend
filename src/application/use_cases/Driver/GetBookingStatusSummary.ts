
import { inject, injectable } from 'tsyringe';
import { IBookingRepository } from '../../../domain/repositories/IBookingrepository'; 
import { HTTP_STATUS_CODES } from '../../../constants/HttpStatusCode';
import { AuthError } from '../../../domain/errors/Autherror';
import { ERROR_MESSAGES } from '../../../constants/ErrorMessages';

@injectable()
export class GetBookingStatusSummary {
  constructor(
    @inject('IBookingRepository')
    private bookingRepo: IBookingRepository
  ) {}

  async execute(driverId: string, year?: number, month?: number): Promise<Record<string, number>> {
    try {
      return await this.bookingRepo.countBookingsByStatus(driverId, year, month);
    } catch (error: any) {
      console.error('GetBookingStatusSummary Use Case Error:', error.message);
      throw new AuthError('Unable to fetch booking status summary', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}
