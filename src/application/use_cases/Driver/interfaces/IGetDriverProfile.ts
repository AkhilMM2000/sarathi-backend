import { DriverResponseDto } from "../../../dto/driver/DriverResponseDto";

export interface IGetDriverProfile {
  execute(driverId: string): Promise<DriverResponseDto | null>;
}
