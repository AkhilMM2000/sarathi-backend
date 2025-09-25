import { WalletTransaction } from "../../../../domain/models/Wallet"; 

export interface IWalletTransaction {
  getTransactionHistory(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ transactions: WalletTransaction[]; total: number }>;

  getWalletBalance(userId: string): Promise<number>;
}
