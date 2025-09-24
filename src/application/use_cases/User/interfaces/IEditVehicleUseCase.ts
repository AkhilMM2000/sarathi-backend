import { Vehicle } from "../../../../domain/models/Vehicle"; 
export interface IEditVehicleUseCase {
  execute(vehicleId: string, updateData: Partial<Vehicle>): Promise<Vehicle | null>;
}