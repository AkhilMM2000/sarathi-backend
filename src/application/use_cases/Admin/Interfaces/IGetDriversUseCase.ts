import { Driver } from "../../../../domain/models/Driver";

import { PaginatedResult } from "../../../../domain/repositories/IBookingrepository";

export interface IGetDriversUseCase {
  execute(page: number, limit: number): Promise<PaginatedResult<Driver>> 
}
