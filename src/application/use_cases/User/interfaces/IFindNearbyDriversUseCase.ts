import { FindNearbyDriversResult } from "../userDTO/Nearbydriver";

export interface IFindNearbyDriversUseCase {
  execute(
    userId: string,
    page?: number,
    limit?: number,
    placeKey?: string
  ): Promise<FindNearbyDriversResult>;
}