
import { inject, injectable } from 'tsyringe';
import { IStripeService } from '../../../domain/services/IStripeService'; 
import { IDriverRepository } from '../../../domain/repositories/IDriverepository';
import { AuthError } from '../../../domain/errors/Autherror';
import { HTTP_STATUS_CODES } from '../../../constants/HttpStatusCode';
import { TOKENS } from '../../../constants/Tokens';
import { CreatePaymentIntentRequestDTO, CreatePaymentIntentResponseDTO } from './userDTO/CreatePaymentIntentDTO';
import { ICreatePaymentIntent } from './interfaces/ICreatePaymentIntent';


@injectable()
export class CreatePaymentIntent implements ICreatePaymentIntent {
  constructor(
    @inject(TOKENS.PAYMENT_SERVICE)
    private stripeService: IStripeService,

    @inject(TOKENS.IDRIVER_REPO) 
    private driverRepository: IDriverRepository,
  ) {}

  async execute({
    amount,
    driverId,
  }: CreatePaymentIntentRequestDTO): Promise<CreatePaymentIntentResponseDTO>{
    const platformFee = Math.floor(amount * 0.1); // 10% platform fee
const driver = await this.driverRepository.findDriverById(driverId);

console.log(driver?.stripeAccountId)
if(driver){
  if(!driver.stripeAccountId){
    throw new AuthError("Driver not found or not onboarded",  HTTP_STATUS_CODES.NOT_FOUND);
  }
  
}

    return await this.stripeService.createPaymentIntent({
      amount,
      driverStripeAccountId: driver?.stripeAccountId || '',
      platformFee,
    });
  }
}
