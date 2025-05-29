import { inject, injectable } from "tsyringe";
import { IFareCalculatorService } from "../../services/FareCalculatorService"; 
import { BookingType } from "../../../domain/models/Booking"; 

interface GetEstimatedFareParams {
  bookingType: BookingType;
  estimatedKm?: number;
  startDate: Date;
  endDate?: Date;
}

@injectable()
export class GetEstimatedFare {
  constructor(
    @inject("IFareCalculatorService")
    private fareCalculatorService: IFareCalculatorService
  ) {}


  async execute(params: GetEstimatedFareParams): Promise<number> {
    console.log('worked');
    return this.fareCalculatorService.calculate(params);
  }
}
