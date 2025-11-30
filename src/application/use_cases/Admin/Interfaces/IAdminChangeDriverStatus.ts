import { Driver } from "../../../../domain/models/Driver";

export interface IAdminChangeDriverStatusUseCase {
  execute(
    driverId: string,
    status: "pending" | "approved" | "rejected",
    reason?: string
  ): Promise<Driver | null>  // or Driver if you want strict typing
}
