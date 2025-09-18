import { inject, injectable } from "tsyringe";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { Driver } from "../../../domain/models/Driver";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";

@injectable()
export class AdminChangeDriverStatus {
  constructor(
    @inject("IDriverRepository") private driverRepository: IDriverRepository,
    @inject("INotificationService")
    private notificationService: INotificationService
  ) {}

  async execute(
    driverId: string,
    status: "pending" | "approved" | "rejected",
    reason?: string
  ): Promise<Driver | null> {

    if (!["pending", "approved", "rejected"].includes(status)) {
        throw new AuthError("Invalid status value.", 400); // Bad Request
      }
      
     
      if (status === "rejected" && !reason) {
        throw new AuthError("Rejection reason is required.", 422); // Unprocessable Entity
      }
      
    await this.notificationService.adminChangeDriverStatusNotification(driverId, { status, reason });
    return await this.driverRepository.updateStatus(driverId, status, reason);

  }
}



