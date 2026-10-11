import { BookingType } from "../../models/Booking";

export enum RideType {
  ECONOMY = "ECONOMY",
  PREMIUM = "PREMIUM",
  XL = "XL"
}

export interface PricingContext {
  rideType: RideType;
  bookingType: BookingType;
  distanceKm: number;
  durationMinutes?: number;
  surgeMultiplier?: number;
  startDate: Date;
  endDate?: Date;
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  totalFare: number;
  rideType: RideType;
}

export interface IPricingStrategy {
  readonly strategyName: string;
  calculateFare(context: PricingContext): FareBreakdown;
}
