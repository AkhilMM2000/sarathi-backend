import { IDriverRepository } from "../../domain/repositories/IDriverepository";

import { Vehicle } from "../../domain/models/Vehicle";
import { inject, injectable } from "tsyringe";
import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";
import { TOKENS } from "../../constants/Tokens";
@injectable()

export class GetAllVehicle {
  constructor(
    @inject(TOKENS.VEHICLE_REPO) private vehicleRepository: IVehicleRepository


  ) {}

  async execute(): Promise<Vehicle[]> {
    return await this.vehicleRepository.findAll();
  }
}

