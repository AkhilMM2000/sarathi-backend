    import { injectable, inject } from "tsyringe";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { AuthError } from "../../../domain/errors/Autherror";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { TOKENS } from "../../../constants/Tokens";


@injectable()
export class WalletBallence {

   constructor( @inject(TOKENS.WALLET_REPO) private walletRepository: IWalletRepository) {

   }


  async execute(userId:string) {
    if (!userId) {
      throw new AuthError("user id required for walletballence",HTTP_STATUS_CODES.NOT_FOUND);
    }

    return this.walletRepository.walletBalance(userId);
  }
}
