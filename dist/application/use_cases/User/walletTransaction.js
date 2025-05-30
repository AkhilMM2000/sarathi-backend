"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletTransaction = void 0;
const Autherror_1 = require("../../../domain/errors/Autherror");
const tsyringe_1 = require("tsyringe");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
let walletTransaction = class walletTransaction {
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }
    async getTransactionHistory(userId, page, limit) {
        try {
            const wallet = await this.walletRepository.getWalletByUserId(userId);
            if (!wallet) {
                throw new Autherror_1.AuthError("Wallet not found.", HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            const transactions = await this.walletRepository.getTransactions(userId, page, limit);
            return transactions;
        }
        catch (error) {
            throw new Autherror_1.AuthError("Failed to get transaction history: " + error.message, HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
    async getWalletBallence(userId) {
        try {
            const wallet = await this.walletRepository.getWalletByUserId(userId);
            if (!wallet) {
                throw new Autherror_1.AuthError("Wallet not found.", HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            return wallet.balance;
        }
        catch (error) {
            throw new Autherror_1.AuthError("Failed to get transaction by ID: " + error.message, HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.walletTransaction = walletTransaction;
exports.walletTransaction = walletTransaction = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IWalletRepository")),
    __metadata("design:paramtypes", [Object])
], walletTransaction);
//# sourceMappingURL=walletTransaction.js.map