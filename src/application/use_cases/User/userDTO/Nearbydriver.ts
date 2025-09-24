
import { Driver } from "../../../../domain/models/Driver";

export interface NearbyDriverDTO extends Omit<Driver, "password"> {
  distance: number | null; // in meters
}


export interface PaginatedResultDTO<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
