

import { Booking } from "../../../../domain/models/Booking";
import { BookingType } from "../../../../domain/models/Booking";

export interface BookDriverInput {
  userId: string;
  driverId: string;
  fromLocation: string;
  toLocation?: string;
  startDate: Date;
  endDate?: Date;
  estimatedKm?: number;
  bookingType: BookingType;
}

export interface IBookDriverUseCase {
  execute(data: BookDriverInput): Promise<Booking>;
}
