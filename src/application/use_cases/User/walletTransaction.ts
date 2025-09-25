import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { AuthError } from "../../../domain/errors/Autherror";
import { WalletTransaction } from "../../../domain/models/Wallet";
import { inject, injectable } from "tsyringe";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IWalletTransaction } from "./interfaces/IWalletTransaction";
import { TOKENS } from "../../../constants/Tokens";

@injectable()
export class WalletTransactionUseCase implements IWalletTransaction {
  constructor(
    @inject(TOKENS.WALLET_REPO) private walletRepository: IWalletRepository
  ) {}

  async getTransactionHistory(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    const wallet = await this.walletRepository.getWalletByUserId(userId);
    if (!wallet) {
      throw new AuthError("Wallet not found.", HTTP_STATUS_CODES.NOT_FOUND);
    }
    return await this.walletRepository.getTransactions(userId, page, limit);
  }

  async getWalletBalance(userId: string): Promise<number> {
    const wallet = await this.walletRepository.getWalletByUserId(userId);
    if (!wallet) {
      throw new AuthError("Wallet not found.", HTTP_STATUS_CODES.NOT_FOUND);
    }
    return wallet.balance;
  }
}
