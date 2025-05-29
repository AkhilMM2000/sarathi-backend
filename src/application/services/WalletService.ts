import { IWalletRepository } from "../../domain/repositories/IWalletRepository"; 
import { AuthError } from "../../domain/errors/Autherror"; 
import { Wallet } from "../../domain/models/Wallet"; 
import { inject, injectable } from "tsyringe";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";


@injectable()
export class WalletService {
  constructor( @inject("IWalletRepository") private walletRepository: IWalletRepository) {}

  async createWallet(userId: string): Promise<Wallet> {
    try {
      const existingWallet = await this.walletRepository.getWalletByUserId(userId);
      if (existingWallet) {
        throw new AuthError("Wallet already exists for this user.",HTTP_STATUS_CODES.CONFLICT);
      }
      return await this.walletRepository.createWallet(userId);
    } catch (error: any) {
      throw new AuthError("Failed to create wallet: " + error.message, 500);
    }
  }

  async creditAmount(userId: string, amount: number, description: string): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.getWalletByUserId(userId);
      if (!wallet) {
        throw new AuthError("Wallet not found.",HTTP_STATUS_CODES.NOT_FOUND);
      }

      const updatedWallet = await this.walletRepository.creditAmount(
        userId,
        amount,
        description
      );

      return updatedWallet;
    } catch (error: any) {
      throw new AuthError("Failed to credit wallet: " + error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async debitAmount(userId: string, amount: number, description: string): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.getWalletByUserId(userId);
      if (!wallet) {
        throw new AuthError("Wallet not found.", HTTP_STATUS_CODES.NOT_FOUND);
      }

      if (wallet.balance < amount) {
        throw new AuthError("Insufficient wallet balance.", HTTP_STATUS_CODES.BAD_REQUEST);
      }

      const updatedWallet = await this.walletRepository.debitAmount(
        userId,
        amount,
        description
      );

      return updatedWallet;
    } catch (error: any) {
      throw new AuthError("Failed to debit wallet: " + error.message,HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async getWalletByUserId(userId: string): Promise<Wallet | null> {
    try {
      const wallet = await this.walletRepository.getWalletByUserId(userId);
      if (!wallet) {
        throw new AuthError("Wallet not found.", HTTP_STATUS_CODES.NOT_FOUND);
      }
      return wallet;
    } catch (error: any) {
      throw new AuthError("Failed to fetch wallet: " + error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}
