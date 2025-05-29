import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { AuthError } from "../../../domain/errors/Autherror";

import { inject, injectable } from "tsyringe";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository";
import { paymentStatus } from "../../../domain/models/Booking";
import { IStripeService } from "../../../domain/services/IStripeService";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository";

@injectable()
export class WalletPayment {
  constructor(
    @inject("IWalletRepository") private walletRepository: IWalletRepository,
    @inject("IBookingRepository")
    private bookingRepo: IBookingRepository,
    @inject("StripePaymentService")
    private stripeService: IStripeService,
    @inject("IDriverRepository") private driverRepository: IDriverRepository
  ) {}
  async WalletRidePayment(rideId: string, userId: string, amount: number) {
    try {
      const Payment = {
        paymentStatus: paymentStatus.COMPLETED,
      };

      const Ride = await this.bookingRepo.findBookingById(rideId);
      const driver = await this.driverRepository.findDriverById(
        Ride?.driverId.toString()!
      );
      if (!Ride) {
        throw new AuthError("Ride not found", HTTP_STATUS_CODES.NOT_FOUND);
      }
      if (!driver?.stripeAccountId) {
        throw new AuthError(
          "stripe connected account not found",
          HTTP_STATUS_CODES.NOT_FOUND
        );
      }
//  await this.stripeService.transferToDriverFromWallet(
//         Ride?.driverId.toString(),
//         amount,
//         driver?.stripeAccountId
//       );
      await this.bookingRepo.updateBooking(rideId, {...Payment,walletDeduction:amount,driver_fee:Math.floor(amount*0.9)});
      await this.walletRepository.debitAmount(
        userId,
        amount,
        `ride on ${Ride?.startDate}`
      );

     
    } catch (error: any) {
      throw new AuthError(
        "Failed to do ride wallet payment " + error.message,
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }
}
