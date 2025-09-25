import { DriverReview } from "../../../../domain/models/DriverReview";
import { SubmitDriverReviewInput } from "../userDTO/CreateReviewInput";

export interface ISubmitDriverReview {
  execute(input: SubmitDriverReviewInput):Promise<DriverReview>
}