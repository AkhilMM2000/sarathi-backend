
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";  
import { AuthError } from "../../../domain/errors/Autherror";
import { Wallet, WalletTransaction } from "../../../domain/models/Wallet";
import { inject, injectable } from "tsyringe";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode"; 


@injectable()
export class walletTransaction{
  constructor( @inject("IWalletRepository") private walletRepository: IWalletRepository) {}
async getTransactionHistory(userId: string,page:number,limit:number): Promise<{ transactions: WalletTransaction[]; total: number }> {
    try {
      const wallet = await this.walletRepository.getWalletByUserId(userId);
      if (!wallet) {
        throw new AuthError("Wallet not found.",HTTP_STATUS_CODES.NOT_FOUND);
      }
      const transactions = await this.walletRepository.getTransactions(userId,page,limit);
      return transactions;
    } catch (error: any) {
      throw new AuthError("Failed to get transaction history: " + error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async getWalletBallence(userId: string): Promise<number> {
    try {
      const wallet = await this.walletRepository.getWalletByUserId(userId);
      if (!wallet) {
        throw new AuthError("Wallet not found.",HTTP_STATUS_CODES.NOT_FOUND);
      }
      return wallet.balance
    } catch (error: any) {
      throw new AuthError("Failed to get transaction by ID: " + error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }


}


