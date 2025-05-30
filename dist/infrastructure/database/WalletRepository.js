"use strict";
// src/infrastructure/database/MongoWalletRepository.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoWalletRepository = void 0;
const Walletschema_1 = require("./modals/Walletschema");
const Autherror_1 = require("../../domain/errors/Autherror"); // Assuming you have this
const mongoose_1 = __importStar(require("mongoose"));
const tsyringe_1 = require("tsyringe");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
let MongoWalletRepository = class MongoWalletRepository {
    async createWallet(userId) {
        try {
            const newWallet = await Walletschema_1.WalletModel.create({
                userId: new mongoose_1.Types.ObjectId(userId),
                balance: 0,
                transactions: [],
            });
            return this.toIWallet(newWallet);
        }
        catch (error) {
            throw new Autherror_1.AuthError('Failed to create wallet.');
        }
    }
    async getWalletByUserId(userId) {
        try {
            const wallet = await Walletschema_1.WalletModel.findOne({ userId: new mongoose_1.Types.ObjectId(userId) });
            return wallet ? this.toIWallet(wallet) : null;
        }
        catch (error) {
            throw new Autherror_1.AuthError('Failed to fetch wallet.', HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
    async walletBalance(userId) {
        try {
            const wallet = await Walletschema_1.WalletModel.findOne({ userId: new mongoose_1.Types.ObjectId(userId) }, { balance: 1 });
            return wallet ? wallet.balance : 0;
        }
        catch (error) {
            throw new Autherror_1.AuthError('Failed to fetch wallet.', HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
    async creditAmount(userId, amount, description) {
        try {
            const wallet = await Walletschema_1.WalletModel.findOne({ userId: new mongoose_1.Types.ObjectId(userId) });
            if (!wallet) {
                throw new Autherror_1.AuthError('Wallet not found.');
            }
            const transactionId = new mongoose_1.Types.ObjectId().toString();
            wallet.balance += amount;
            wallet.transactions.push({
                transactionId,
                type: 'CREDIT',
                amount,
                description,
                createdAt: new Date(),
            });
            await wallet.save();
            return this.toIWallet(wallet);
        }
        catch (error) {
            throw new Autherror_1.AuthError('Failed to credit amount.');
        }
    }
    async debitAmount(userId, amount, description) {
        try {
            const wallet = await Walletschema_1.WalletModel.findOne({ userId: new mongoose_1.Types.ObjectId(userId) });
            if (!wallet) {
                throw new Autherror_1.AuthError('Wallet not found.', 404);
            }
            if (wallet.balance < amount) {
                throw new Autherror_1.AuthError('Insufficient wallet balance.', 400);
            }
            const transactionId = new mongoose_1.default.Types.ObjectId().toString();
            wallet.balance -= amount;
            wallet.transactions.push({
                transactionId,
                type: 'DEBIT',
                amount,
                description,
                createdAt: new Date(),
            });
            await wallet.save();
            return this.toIWallet(wallet);
        }
        catch (error) {
            throw new Autherror_1.AuthError('Failed to debit amount.', 500);
        }
    }
    async getTransactions(userId, page = 1, limit = 10) {
        try {
            const wallet = await Walletschema_1.WalletModel.findOne({ userId: new mongoose_1.default.Types.ObjectId(userId) });
            if (!wallet) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.WALLET_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            const total = wallet.transactions.length;
            const startIndex = (page - 1) * limit;
            const paginatedTransactions = wallet.transactions
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // latest first
                .slice(startIndex, startIndex + limit);
            return {
                transactions: paginatedTransactions,
                total: Math.ceil(total / limit),
            };
        }
        catch (error) {
            throw new Autherror_1.AuthError('Failed to get transactions.', HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
    toIWallet(wallet) {
        return {
            _id: wallet._id.toString(),
            userId: wallet.userId.toString(),
            balance: wallet.balance,
            transactions: wallet.transactions,
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt,
        };
    }
};
exports.MongoWalletRepository = MongoWalletRepository;
exports.MongoWalletRepository = MongoWalletRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoWalletRepository);
//# sourceMappingURL=WalletRepository.js.map