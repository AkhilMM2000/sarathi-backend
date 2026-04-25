import { inject, injectable } from "tsyringe";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { TOKENS } from "../../../constants/Tokens";
import { IGetDriversUseCase } from "./Interfaces/IGetDriversUseCase";
import { PaginatedResult } from "../../../domain/repositories/IBookingrepository";
import { AdminDriverResponseDto, toAdminDriverListResponse } from "../../dto/admin/AdminResponseDto";

@injectable()
export class GetDrivers implements IGetDriversUseCase {
  constructor(
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository
  ) {}

  async execute(page: number, limit: number): Promise<PaginatedResult<AdminDriverResponseDto>> {
    const result = await this.driverRepository.getDrivers(page, limit);
    
    return {
      ...result,
      data: toAdminDriverListResponse(result.data)
    };
  }
}