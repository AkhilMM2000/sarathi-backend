import { IDriverRepository } from "../../domain/repositories/IDriverepository";

import { Vehicle } from "../../domain/models/Vehicle";
import { inject, injectable } from "tsyringe";
import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";
@injectable()

export class GetAllVehicle {
  constructor(
    @inject("IVehicleRepository") private vehicleRepository: IVehicleRepository


  ) {}

  async execute(): Promise<Vehicle[]> {
    return await this.vehicleRepository.findAll();
  }
}

