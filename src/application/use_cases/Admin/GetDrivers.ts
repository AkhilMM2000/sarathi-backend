
import { inject, injectable } from "tsyringe";
import { IDriverRepository} from "../../../domain/repositories/IDriverepository";
import { Driver } from "../../../domain/models/Driver";
import { TOKENS } from "../../../constants/Tokens";
import { IGetDriversUseCase } from "./Interfaces/IGetDriversUseCase";
import { PaginatedResult } from "../../../domain/repositories/IBookingrepository";

@injectable()
export class GetDrivers  implements IGetDriversUseCase {
  constructor(
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository


  ) {}

  async execute(page: number, limit: number): Promise<PaginatedResult<Driver>> {
    return await this.driverRepository.getDrivers(page, limit);
  }
}