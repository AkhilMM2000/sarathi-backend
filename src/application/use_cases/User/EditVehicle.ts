import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository";
import { Vehicle } from "../../../domain/models/Vehicle";
import { inject, injectable } from "tsyringe";
import { AuthError } from "../../../domain/errors/Autherror";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { TOKENS } from "../../../constants/Tokens";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { IEditVehicleUseCase } from "./interfaces/IEditVehicleUseCase";

@injectable()
export class EditVehicle implements IEditVehicleUseCase {
  constructor(
    @inject(TOKENS.VEHICLE_REPO) private vehicleRepository: IVehicleRepository
  ) {}

  async execute(vehicleId: string, updateData: Partial<Vehicle>): Promise<Vehicle|null> {
    if (!vehicleId) {
        throw new AuthError(ERROR_MESSAGES.VIHICLE_ID_MISS, HTTP_STATUS_CODES.BAD_REQUEST); 
      }
    
    const updatedVehicle = await this.vehicleRepository.editVehicle(vehicleId, updateData);
    if (!updatedVehicle) {
        throw new AuthError(ERROR_MESSAGES.VEHICLE_UPDATE_FAILE ,HTTP_STATUS_CODES.NOT_FOUND); 
      }

    return updatedVehicle;
  }

}
