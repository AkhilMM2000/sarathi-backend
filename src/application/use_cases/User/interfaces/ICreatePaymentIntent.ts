import { CreatePaymentIntentRequestDTO,CreatePaymentIntentResponseDTO } from "../userDTO/CreatePaymentIntentDTO"; 

export interface ICreatePaymentIntent {
  execute(request: CreatePaymentIntentRequestDTO): Promise<CreatePaymentIntentResponseDTO>;
}
