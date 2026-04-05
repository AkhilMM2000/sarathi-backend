import { Driver } from "../../../domain/models/Driver";

export interface DriverWithDistance {
  _id: string;
  name: string;
  profileImage?: string;
  location: any;
  place?: string;
  averageRating?: number;
  distance: number | null;
}

export interface IGetNearbyDriverDetailsUseCase {
  execute(
    userId: string,
    driverId: string,
    lat?: number,
    lng?: number
  ): Promise<DriverWithDistance>;
}
