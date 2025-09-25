import { inject, injectable } from "tsyringe";
import { IDriverReviewRepository } from "../../../domain/repositories/IDriverReviewRepository";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository"; 
import { DriverReview } from "../../../domain/models/DriverReview"; 
import { AuthError } from "../../../domain/errors/Autherror";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { TOKENS } from "../../../constants/Tokens";
import { SubmitDriverReviewInput } from "./userDTO/CreateReviewInput";
import { ISubmitDriverReview } from "./interfaces/ISubmitDriverReview";

@injectable()
export class SubmitDriverReview implements ISubmitDriverReview{
  constructor(
    @inject(TOKENS.DRIVER_REVIEW_REPO)
    private reviewRepo: IDriverReviewRepository,
    @inject(TOKENS.IDRIVER_REPO)
    private driverRepo: IDriverRepository
  ) {}

  async execute(input: SubmitDriverReviewInput): Promise<DriverReview> {
    const { driverId, userId, rideId, rating, review } = input;

    const alreadyReviewed = await this.reviewRepo.hasUserAlreadyReviewed(driverId, userId);
    if (alreadyReviewed) {
      throw new AuthError("You have already reviewed this driver.",HTTP_STATUS_CODES.BAD_REQUEST);
    }

    const newReview = await this.reviewRepo.createReview({
      driverId,
      userId,
      rideId,
      rating,
      review,
    });

    // Fetch current rating stats
    const driver = await this.driverRepo.findDriverById(driverId);
    if (!driver) throw new AuthError("Driver not found",HTTP_STATUS_CODES.NOT_FOUND);

    const updatedTotalPoints = (driver.totalRatingPoints || 0) + rating;
    const updatedTotalRatings = (driver.totalRatings || 0) + 1;
    const updatedAverage = updatedTotalPoints / updatedTotalRatings;

    await this.driverRepo.updateRatingStats(driverId, {
      totalRatingPoints: updatedTotalPoints,
      totalRatings: updatedTotalRatings,
      averageRating: parseFloat(updatedAverage.toFixed(2)),
    });

    return newReview;
  }
}
