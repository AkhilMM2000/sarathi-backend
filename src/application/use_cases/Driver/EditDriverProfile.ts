import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { Driver } from "../../../domain/models/Driver";
import { inject, injectable } from "tsyringe";
import { AuthError } from "../../../domain/errors/Autherror"; 
import { TOKENS } from "../../../constants/Tokens";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IEditDriverProfile } from "./interfaces/IEditDriverProfile";

@injectable()
export class EditDriverProfile implements IEditDriverProfile  {
  constructor(
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository
  ) {}

  async execute(driverId: string, updateData: Partial<Driver>): Promise<Driver|null> {
    if (!driverId) {
      throw new AuthError(ERROR_MESSAGES.DRIVER_ID_NOT_FOUND, HTTP_STATUS_CODES.BAD_REQUEST);
    }
console.log(updateData.location)
    const existingDriver = await this.driverRepository.findDriverById(driverId);
    if (!existingDriver) {
      throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }

    const updatedDriver = await this.driverRepository.update(driverId, updateData);

    return updatedDriver;
  }
}
