import { inject, injectable } from "tsyringe";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { Driver } from "../../../domain/models/Driver";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IAdminChangeDriverStatusUseCase } from "./Interfaces/IAdminChangeDriverStatus";

@injectable()
export class AdminChangeDriverStatus implements IAdminChangeDriverStatusUseCase  {
  constructor(
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository,
    @inject(TOKENS.NOTIFICATION_SERVICE)
    private notificationService: INotificationService
  ) {}

  async execute(
    driverId: string,
    status: "pending" | "approved" | "rejected",
    reason?: string
  ): Promise<Driver | null> {

    if (!["pending", "approved", "rejected"].includes(status)) {
        throw new AuthError("Invalid status value.", HTTP_STATUS_CODES.BAD_REQUEST); // Bad Request
      }
      
     
      if (status === "rejected" && !reason) {
        throw new AuthError("Rejection reason is required.", HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY); // Unprocessable Entity
      }
      
    await this.notificationService.adminChangeDriverStatusNotification(driverId, { status, reason });
    return await this.driverRepository.updateStatus(driverId, status, reason);

  }
}



