import { Booking } from "../models/Booking";
export type rideHistory = Booking & {
  name: string;
  email: string;
  profile: string;
  place: string;
  mobile?: string;
};
export type BookingWithUsername = Booking & {
  username: string;
  place: string;
  drivername?: string;
  driverImage?: string;
  userImage?: string;
};

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
export interface IBookingRepository {
  GetAllBookings(
    page: number,
    limit: number
  ): Promise<PaginatedResult<BookingWithUsername>>;
  createBooking(booking: Booking): Promise<Booking>;
  findBookingById(id: string): Promise<Booking | null>;
  findBookingsByUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResult<BookingWithUsername>>;
  findBookingsByDriver(
    driverId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResult<rideHistory>>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null>;
  checkDriverAvailability(
    driverId: string,
    start: Date,
    end?: Date
  ): Promise<boolean>;
  getRideHistoryByRole(
    id: string,
    role: "user" | "driver",
    page: number,
    limit: number
  ): Promise<PaginatedResult<rideHistory>>;

  countBookingsByStatus(driverId: string, year?: number, month?: number): Promise<Record<string, number>>;

  getDriverEarningsByMonth(driverId: string, year: number, month?: number): Promise<{
    chartData: { label: string; totalEarnings: number }[];
    totalEarnings: number;
    totalRides: number;
  }>
}
