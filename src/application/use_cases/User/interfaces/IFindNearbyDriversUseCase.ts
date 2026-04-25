import { PaginatedResultDTO } from "../userDTO/Nearbydriver";
import { DriverResponseDto } from "../../../dto/driver/DriverResponseDto";

export interface IFindNearbyDriversUseCase {
  execute(
    userId: string,
    page?: number,
    limit?: number,
    placeKey?: string,
    lat?: number,
    lng?: number
  ): Promise<PaginatedResultDTO<DriverResponseDto>>;
}