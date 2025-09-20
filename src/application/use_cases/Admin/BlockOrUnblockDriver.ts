import { inject, injectable } from "tsyringe";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository"; 
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";

@injectable()
export class BlockOrUnblockDriver {
  constructor(
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository
  ) {}

  async execute(driverId: string, isBlock: boolean): Promise<void> {
    
    const driver = await this.driverRepository.findDriverById(driverId);
    if (!driver) {
        throw new AuthError("Driver not found", 404);
      }
      

    await this.driverRepository.blockOrUnblockDriver(driverId, isBlock);
  }
}
