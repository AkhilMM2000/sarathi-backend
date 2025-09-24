import { Vehicle } from "../../../../domain/models/Vehicle";

export interface IGetVehiclesByUserUseCase {
  execute(userId: string): Promise<Vehicle[]>;
}
