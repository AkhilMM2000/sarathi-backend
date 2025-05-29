import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { Driver } from "../../../domain/models/Driver";
import { inject, injectable } from "tsyringe";
import { AuthError } from "../../../domain/errors/Autherror"; 

@injectable()
export class EditDriverProfile {
  constructor(
    @inject("IDriverRepository") private driverRepository: IDriverRepository
  ) {}

  async execute(driverId: string, updateData: Partial<Driver>): Promise<Driver|null> {
    if (!driverId) {
      throw new AuthError("Driver ID is required", 400);
    }

    const existingDriver = await this.driverRepository.findDriverById(driverId);
    if (!existingDriver) {
      throw new AuthError("Driver not found", 404);
    }

    const updatedDriver = await this.driverRepository.update(driverId, updateData);

    return updatedDriver;
  }
}
