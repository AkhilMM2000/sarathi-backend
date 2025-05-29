


import { inject, injectable } from "tsyringe";
import { IDriverRepository} from "../../../domain/repositories/IDriverepository";
import { Driver } from "../../../domain/models/Driver";

@injectable()
export class GetDrivers {
  constructor(
    @inject("IDriverRepository") private driverRepository: IDriverRepository


  ) {}

  async execute(): Promise<Driver[]|null> {
    return await this.driverRepository.getDrivers()
  }
}