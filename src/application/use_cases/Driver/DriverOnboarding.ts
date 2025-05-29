import { inject, injectable } from 'tsyringe';
import { IStripeAccountService } from '../../services/Accountservice';
import { IDriverRepository } from '../../../domain/repositories/IDriverepository';

@injectable()
export class OnboardDriverUseCase {
  constructor(
    @inject('StripeService') private stripeService: IStripeAccountService,
     @inject("IDriverRepository") private driverRepository: IDriverRepository
  ) {}

  async execute(email: string, driverId: string) {
    const account = await this.stripeService.createExpressAccount(email, driverId);
    
    await this.driverRepository.updateStripeAccount(driverId, account.id);
    const accountLink = await this.stripeService.createAccountLink(account.id);
    return accountLink.url;
  }
}
