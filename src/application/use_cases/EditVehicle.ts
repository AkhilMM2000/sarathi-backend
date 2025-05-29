import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";
import { Vehicle } from "../../domain/models/Vehicle";
import { inject, injectable } from "tsyringe";
import { AuthError } from "../../domain/errors/Autherror";
import { H } from "@upstash/redis/zmscore-BdNsMd17";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";

@injectable()
export class EditVehicle {
  constructor(
    @inject("IVehicleRepository") private vehicleRepository: IVehicleRepository
  ) {}

  async execute(vehicleId: string, updateData: Partial<Vehicle>): Promise<Vehicle|null> {
    if (!vehicleId) {
        throw new AuthError("Vehicle ID is required", HTTP_STATUS_CODES.BAD_REQUEST); 
      }
    
    const updatedVehicle = await this.vehicleRepository.editVehicle(vehicleId, updateData);
    if (!updatedVehicle) {
        throw new AuthError("Vehicle not found or update failed", HTTP_STATUS_CODES.NOT_FOUND); 
      }

    return updatedVehicle;
  }

}
