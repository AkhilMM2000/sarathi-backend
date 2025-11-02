export interface IAttachPaymentIntentIdToBookingUseCase {
  execute(
    bookingId: string,
    walletDeduction: number,
    paymentIntentId?: string,
    paymentstatus?: string,
    userId?: string
  ): Promise<void>;
}
