import { Driver } from "../../../../domain/models/Driver";
import { EditDriverProfileRequest } from "../../../../presentation/dto/driver/DriverRequestDTO";

export interface IEditDriverProfile {
  execute(driverId: string, updateData: EditDriverProfileRequest | Partial<Driver>): Promise<Driver | null>;
}
