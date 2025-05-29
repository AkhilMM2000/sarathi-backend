// src/application/use_cases/VerifyDriverPaymentAccount.ts
import { inject, injectable } from 'tsyringe';
import { IStripeAccountService } from '../../services/Accountservice'; 
import { IDriverRepository } from '../../../domain/repositories/IDriverepository'; 
import { AuthError } from '../../../domain/errors/Autherror'; 

@injectable()
export class VerifyDriverPaymentAccount {
  constructor(
    @inject('StripeService') private stripeService: IStripeAccountService,
    @inject("IDriverRepository") private driverRepository: IDriverRepository
  ) {}

  async execute(driverId: string): Promise<void> {
    const driver=await this.driverRepository.findDriverById(driverId);
    if(!driver||!driver.stripeAccountId){
      throw new AuthError('Driver not found or Stripe account ID missing', 404); 
      
    }
    const account = await this.stripeService.retrieveAccount(driver.stripeAccountId);
// console.log('Account:', account);
console.log(account.charges_enabled, account.payouts_enabled);
    if (account.charges_enabled&&account.payouts_enabled) {
     
      await this.driverRepository.update(driverId,{activePayment:true});
    } else {
        await this.driverRepository.update(driverId,{stripeAccountId:''});
      throw new AuthError('Stripe account not yet fully activated', 400);
    }

  }

}
