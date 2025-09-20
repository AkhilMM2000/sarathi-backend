import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository"; 
import { Booking, paymentStatus } from "../../../domain/models/Booking"; 
import { AuthError } from "../../../domain/errors/Autherror";
import { IStripeService } from "../../../domain/services/IStripeService";
import { WalletService } from "../../services/WalletService";
import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { INotificationService } from "../../services/NotificationService";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { TOKENS } from "../../../constants/Tokens";

@injectable()
export class AttachPaymentIntentIdToBooking {
  constructor(
    @inject("IBookingRepository")
    private bookingRepo: IBookingRepository,
        @inject("IWalletRepository") private walletRepository: IWalletRepository,
           @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository,
      @inject('StripePaymentService')
        private stripeService: IStripeService,
           @inject("INotificationService")
            private notificationService: INotificationService
  ) {}

  async execute(bookingId: string,walletDeduction:number, paymentIntentId?: string,paymentstatus?:paymentStatus,userId?:string): Promise<void> {
    const booking = await this.bookingRepo.findBookingById(bookingId);
    console.log(walletDeduction,'walletDeduction')
    if (!booking) {
      throw new AuthError('Booking not found', 404);
    }
if(walletDeduction&&walletDeduction>0){
await this.walletRepository.debitAmount(
  booking.userId.toString(),
  walletDeduction,
  `ride booked for ${booking.startDate}`
);
booking.walletDeduction=walletDeduction;
}
    if(paymentIntentId){

    booking.paymentIntentId = paymentIntentId;
  }
  if(paymentstatus){
    booking.paymentStatus = paymentstatus;
  }

  if(paymentstatus&&paymentIntentId){
    const payment=await this.stripeService.retrievePaymentIntent(paymentIntentId);
 
    booking.driver_fee=(payment.amount-payment.application_fee_amount!)*.01;
    booking.platform_fee=payment.application_fee_amount!*.01;
  }

  if(paymentstatus=='COMPLETED'&&userId){
  const user = await this.userRepository.getUserById(userId);

  if (!user) {
    throw new AuthError('User not found', 404); 
    }
  }

    await this.bookingRepo.updateBooking(bookingId, booking);
   console.log(booking.driverId.toString())
   if(paymentstatus=='COMPLETED'){
   await this.notificationService.paymentNotification(booking.driverId.toString(),{status:paymentstatus,startDate:booking.startDate,bookingId})
   }

  }
}
