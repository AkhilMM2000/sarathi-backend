import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { Driver } from "../../../domain/models/Driver";
import { inject, injectable } from "tsyringe";
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";

@injectable()
export class GetDriverProfile {
  constructor(
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository
  ) {}

  async execute(driverId: string): Promise<Driver|null> {
    if (!driverId) {
        throw new AuthError("Driver ID is required", 400);
    }

    const driver = await this.driverRepository.findDriverById(driverId);
    if (!driver) {
      throw new AuthError("Driver not found",404);
    }

    return driver;
  }
}
