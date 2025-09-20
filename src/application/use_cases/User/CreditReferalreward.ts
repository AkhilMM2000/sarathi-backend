// src/application/use_cases/rewards/CreditReferralReward.ts
import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";

import { AuthError } from "../../../domain/errors/Autherror";
import { WalletService } from "../../services/WalletService";
import { TOKENS } from "../../../constants/Tokens";

@injectable()
export class CreditReferralReward {
  constructor(
    @inject(TOKENS.IUSER_REPO) private userRepo: IUserRepository,
   
        @inject(TOKENS.WALLET_SERVICE) private walletService:WalletService ,
  ) {}

  async execute(userId: string, amount: number): Promise<void> {
    const user = await this.userRepo.getUserById(userId);
   let referedUserName:string|undefined
    if (!user) {
      throw new AuthError("User not found", 404);
    }

    const referredBy = user.referredBy;
   
    if (!referredBy) {
      throw new AuthError("No referral found for this user", 400);
    }
    if(user.referredBy){
    const referedUser=await this.userRepo.getUserById(user?.referredBy?.toString())
    referedUserName=referedUser?.name
    }
    // 1. Credit to referred user's wallet
    await this.walletService.creditAmount(userId,amount,`Referral bonus for by register through${referedUserName} ` )
      
    await this.walletService.creditAmount(referredBy,amount, `Referral bonus for inviting ${user.name}` )

    await this.userRepo.updateUser(userId, {referalPay:false});
  }
}
