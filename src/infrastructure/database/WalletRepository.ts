// src/infrastructure/database/MongoWalletRepository.ts

import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { Wallet,WalletTransaction } from '../../domain/models/Wallet'; 
import { WalletModel } from './modals/Walletschema'; 
import { AuthError } from '../../domain/errors/Autherror'; // Assuming you have this
import mongoose, { Types } from 'mongoose';
import { injectable } from 'tsyringe';
import { HTTP_STATUS_CODES } from '../../constants/HttpStatusCode';
import { ERROR_MESSAGES } from '../../constants/ErrorMessages';
@injectable()
export class MongoWalletRepository implements IWalletRepository {
  
  async createWallet(userId: string): Promise<Wallet> {
    try {
      const newWallet = await WalletModel.create({
        userId: new Types.ObjectId(userId),
        balance: 0,
        transactions: [],
      });
      return this.toIWallet(newWallet);
    } catch (error) {
      throw new AuthError('Failed to create wallet.');
    }
  }

  async getWalletByUserId(userId: string): Promise<Wallet | null> {
    try {
      const wallet = await WalletModel.findOne({ userId: new Types.ObjectId(userId) });
      return wallet ? this.toIWallet(wallet) : null;
    } catch (error) {
      throw new AuthError('Failed to fetch wallet.',HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async walletBalance(userId: string): Promise<number> {
     try {
    const wallet = await WalletModel.findOne(
      { userId: new Types.ObjectId(userId) },
      { balance: 1 } 
    );

    return wallet ? wallet.balance : 0; 
  } catch (error) {
    throw new AuthError('Failed to fetch wallet.', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
  }
  
  async creditAmount(userId: string, amount: number, description: string): Promise<Wallet> {
    try {
      const wallet = await WalletModel.findOne({ userId: new Types.ObjectId(userId) });
      if (!wallet) {
        throw new AuthError('Wallet not found.');
      }

      const transactionId = new Types.ObjectId().toString();

      wallet.balance += amount;
      wallet.transactions.push({
        transactionId,
        type: 'CREDIT',
        amount,
        description,
        createdAt: new Date(),
      } as WalletTransaction);

      await wallet.save();
      return this.toIWallet(wallet);
    } catch (error) {
      throw new AuthError('Failed to credit amount.');
    }
  }

  async debitAmount(userId: string, amount: number, description: string): Promise<Wallet> {
    try {
      const wallet = await WalletModel.findOne({ userId: new Types.ObjectId(userId) });
      if (!wallet) {
        throw new AuthError('Wallet not found.',404);
      }

      if (wallet.balance < amount) {
        throw new AuthError('Insufficient wallet balance.',400);
      }

      const transactionId = new mongoose.Types.ObjectId().toString();

      wallet.balance -= amount;
      wallet.transactions.push({
        transactionId,
        type: 'DEBIT',
        amount,
        description,
        createdAt: new Date(),
      } as WalletTransaction);

      await wallet.save();
      return this.toIWallet(wallet);
    } catch (error) {
      throw new AuthError('Failed to debit amount.' ,500);
    }
  }

  async getTransactions(userId: string, page = 1, limit = 10): Promise<{ transactions: WalletTransaction[]; total: number }> {
    try {
      const wallet = await WalletModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  
      if (!wallet) {
        throw new AuthError(ERROR_MESSAGES.WALLET_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
      }
  
      const total = wallet.transactions.length;
      const startIndex = (page - 1) * limit;
      const paginatedTransactions = wallet.transactions
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // latest first
        .slice(startIndex, startIndex + limit);
  
      return {
        transactions: paginatedTransactions,
        total:Math.ceil(total/limit),
      };
    } catch (error) {
      throw new AuthError('Failed to get transactions.', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
  

  private toIWallet(wallet: any): Wallet {
    return {
      _id: wallet._id.toString(),
      userId: wallet.userId.toString(),
      balance: wallet.balance,
      transactions: wallet.transactions,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }
}
