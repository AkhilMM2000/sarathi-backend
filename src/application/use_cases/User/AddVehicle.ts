import { inject, injectable } from "tsyringe";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository";
import { Vehicle} from "../../../domain/models/Vehicle";
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";

@injectable()
export class AddVehicle {
  constructor(
    @inject(TOKENS.VEHICLE_REPO) private vehicleRepository: IVehicleRepository
  ) {}

  
  async execute(vehicleData: Vehicle): Promise<Vehicle> {
    // List of required fields
    const requiredFields: (keyof Vehicle)[] = [
      "userId",
      "vehicleImage",
      "rcBookImage",
      "Register_No",
      "ownerName",
      "vehicleName",
      "vehicleType",
      "polution_expire",
    ];

    // Check if any field is missing
    for (const field of requiredFields) {
      if (!vehicleData[field]) {
        throw new AuthError(`${field} is required`, 400);
      }
    }


    // Save vehicle if all validations pass
    return await this.vehicleRepository.addVehicle(vehicleData);
  }

}
