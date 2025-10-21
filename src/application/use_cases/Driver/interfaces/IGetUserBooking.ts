import { PaginatedResult, rideHistory } from "../../../../domain/repositories/IBookingrepository";

export interface IGetBooking  {
    execute(driverId: string, page: number, limit: number): Promise<PaginatedResult<rideHistory>>
   
}