import { inject, injectable } from 'tsyringe';
import { IStripeAccountService } from '../../services/Accountservice';
import { IDriverRepository } from '../../../domain/repositories/IDriverepository';
import { TOKENS } from '../../../constants/Tokens';
import { IOnboardDriverUseCase } from './interfaces/IOnboardDriverUseCase';

@injectable()
export class OnboardDriverUseCase implements IOnboardDriverUseCase {
  constructor(
    @inject(TOKENS.STRIPE_SERVICE) private stripeService: IStripeAccountService,
     @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository
  ) {}

  async execute(email: string, driverId: string):Promise<string> {
    const account = await this.stripeService.createExpressAccount(email, driverId);
    
    await this.driverRepository.updateStripeAccount(driverId, account.id);
    const accountLink = await this.stripeService.createAccountLink(account.id);
    return accountLink.url;
  }
}
