export interface CreatePaymentIntentRequestDTO {
  amount: number;
  driverId: string;
}

export interface CreatePaymentIntentResponseDTO {
  clientSecret: string;
  paymentIntentId: string;
}
