import { Vehicle } from "../../../domain/models/Vehicle";

export interface IAddVehicleUseCase {
  execute(vehicleData: Vehicle): Promise<Vehicle>;
}
