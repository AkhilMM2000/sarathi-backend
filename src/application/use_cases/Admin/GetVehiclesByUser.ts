import { injectable, inject } from "tsyringe";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository";
import { Vehicle } from "../../../domain/models/Vehicle";
import { Types } from "mongoose";
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";

@injectable()
export class GetVehiclesByUser {
  constructor(
    @inject(TOKENS.VEHICLE_REPO) private vehicleRepository: IVehicleRepository
  ) {}

  async execute(userId: string): Promise<Vehicle[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AuthError("Invalid userId",400);
    }
    
    return await this.vehicleRepository.getVehiclesByUser(userId);
  }
}
