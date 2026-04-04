import { inject, injectable } from "tsyringe";
import { IFareCalculatorService } from "../../services/FareCalculatorService"; 
import { BookingType } from "../../../domain/models/Booking"; 
import { TOKENS } from "../../../constants/Tokens";
import { IGetEstimatedFare } from "./interfaces/IGetEstimatedFare";
import { GetEstimatedFareRequest } from "../../../presentation/dto/booking/BookingRequestDTO";

@injectable()
export class GetEstimatedFare implements IGetEstimatedFare{
  constructor(
    @inject(TOKENS.IFARE_CALCULATE_SERVICE)
    private fareCalculatorService: IFareCalculatorService
  ) {}


  async execute(params: GetEstimatedFareRequest): Promise<number> {
 
    return this.fareCalculatorService.calculate(params);
  }
}
