


import { inject, injectable } from "tsyringe";
import { IDriverRepository} from "../../../domain/repositories/IDriverepository";
import { Driver } from "../../../domain/models/Driver";
import { TOKENS } from "../../../constants/Tokens";

@injectable()
export class GetDrivers {
  constructor(
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository


  ) {}

  async execute(): Promise<Driver[]|null> {
    return await this.driverRepository.getDrivers()
  }
}