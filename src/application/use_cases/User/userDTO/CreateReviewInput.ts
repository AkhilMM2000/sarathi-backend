export interface SubmitDriverReviewInput {
  driverId: string;
  userId: string;
  rideId: string;
  rating: number;
  review?: string;
}
