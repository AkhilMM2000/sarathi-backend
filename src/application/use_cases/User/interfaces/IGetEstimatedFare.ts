import { GetEstimatedFareRequest } from "../../../../presentation/dto/booking/BookingRequestDTO";

export interface IGetEstimatedFare {
  execute(params: GetEstimatedFareRequest): Promise<number>;
}
