import { inject, injectable } from "tsyringe";
import { IDriverReviewRepository } from "../../../domain/repositories/IDriverReviewRepository";
import { TOKENS } from "../../../constants/Tokens";
import { IGetDriverReviewsUseCase } from "./interfaces/IGetDriverReviewsUseCase";

@injectable()
export class GetDriverReviews  implements IGetDriverReviewsUseCase  {
  constructor(
    @inject(TOKENS.DRIVER_REVIEW_REPO)
    private reviewRepo: IDriverReviewRepository
  ) {}

  async execute(driverId: string,page: number = 1, limit: number = 3) {
    return await this.reviewRepo.getReviewsByDriverId(driverId,page, limit);
  }
}
