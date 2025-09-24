import { injectable, inject } from "tsyringe";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository";
import { Vehicle } from "../../../domain/models/Vehicle";
import { TOKENS } from "../../../constants/Tokens";
import { IGetVehiclesByUserUseCase } from "./interfaces/IGetVehiclesByUserUseCase";

@injectable()
export class GetVehiclesByUser implements IGetVehiclesByUserUseCase{
  constructor(
    @inject(TOKENS.VEHICLE_REPO) private vehicleRepository: IVehicleRepository
  ) {}

  async execute(userId: string): Promise<Vehicle[]> {
   
    
    return await this.vehicleRepository.getVehiclesByUser(userId);
  }
}
