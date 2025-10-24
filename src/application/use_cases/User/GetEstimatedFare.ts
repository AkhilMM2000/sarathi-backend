import { inject, injectable } from "tsyringe";
import { IFareCalculatorService } from "../../services/FareCalculatorService"; 
import { BookingType } from "../../../domain/models/Booking"; 
import { TOKENS } from "../../../constants/Tokens";

interface GetEstimatedFareParams {
  bookingType: BookingType;
  estimatedKm?: number;
  startDate: Date;
  endDate?: Date;
}

@injectable()
export class GetEstimatedFare {
  constructor(
    @inject(TOKENS.IFARE_CALCULATE_SERVICE)
    private fareCalculatorService: IFareCalculatorService
  ) {}


  async execute(params: GetEstimatedFareParams): Promise<number> {
 
    return this.fareCalculatorService.calculate(params);
  }
}
