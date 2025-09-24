// src/domain/usecases/INearbyDriverUseCase.ts
import { PaginatedResultDTO } from "../userDTO/Nearbydriver";
import { NearbyDriverDTO } from "../userDTO/Nearbydriver";

export interface INearbyDriverUseCase {
  execute(
    userId: string,
    page?: number,
    limit?: number,
    placeKey?: string
  ): Promise<PaginatedResultDTO<NearbyDriverDTO>>;
}
