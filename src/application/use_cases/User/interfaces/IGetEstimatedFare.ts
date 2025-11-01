// src/application/use_cases/User/interfaces/IGetEstimatedFare.ts
import { BookingType } from "../../../../domain/models/Booking";

export interface IGetEstimatedFare {
  execute(params: {
    bookingType: BookingType;
    estimatedKm?: number;
    startDate: Date;
    endDate?: Date;
  }): Promise<number>;
}
