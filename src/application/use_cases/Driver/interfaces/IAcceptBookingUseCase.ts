import { Booking } from "../../../../domain/models/Booking";
import { AcceptBookingInput } from "../AcceptBooking";

export interface IAcceptBookingUseCase {
  execute(data: AcceptBookingInput): Promise<Booking>;
}
