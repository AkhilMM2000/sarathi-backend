import { inject, injectable } from "tsyringe";
import { IDriverReviewRepository } from "../../domain/repositories/IDriverReviewRepository";

@injectable()
export class GetDriverReviews {
  constructor(
    @inject("DriverReviewRepository")
    private reviewRepo: IDriverReviewRepository
  ) {}

  async execute(driverId: string,page: number = 1, limit: number = 3) {
    return await this.reviewRepo.getReviewsByDriverId(driverId,page, limit);
  }
}
