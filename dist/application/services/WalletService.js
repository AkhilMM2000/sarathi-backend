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
exports.WalletService = void 0;
const Autherror_1 = require("../../domain/errors/Autherror");
const tsyringe_1 = require("tsyringe");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
let WalletService = class WalletService {
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }
    async createWallet(userId) {
        try {
            const existingWallet = await this.walletRepository.getWalletByUserId(userId);
            if (existingWallet) {
                throw new Autherror_1.AuthError("Wallet already exists for this user.", HttpStatusCode_1.HTTP_STATUS_CODES.CONFLICT);
            }
            return await this.walletRepository.createWallet(userId);
        }
        catch (error) {
            throw new Autherror_1.AuthError("Failed to create wallet: " + error.message, 500);
        }
    }
    async creditAmount(userId, amount, description) {
        try {
            const wallet = await this.walletRepository.getWalletByUserId(userId);
            if (!wallet) {
                throw new Autherror_1.AuthError("Wallet not found.", HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            const updatedWallet = await this.walletRepository.creditAmount(userId, amount, description);
            return updatedWallet;
        }
        catch (error) {
            throw new Autherror_1.AuthError("Failed to credit wallet: " + error.message, HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
    async debitAmount(userId, amount, description) {
        try {
            const wallet = await this.walletRepository.getWalletByUserId(userId);
            if (!wallet) {
                throw new Autherror_1.AuthError("Wallet not found.", HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            if (wallet.balance < amount) {
                throw new Autherror_1.AuthError("Insufficient wallet balance.", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            const updatedWallet = await this.walletRepository.debitAmount(userId, amount, description);
            return updatedWallet;
        }
        catch (error) {
            throw new Autherror_1.AuthError("Failed to debit wallet: " + error.message, HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
    async getWalletByUserId(userId) {
        try {
            const wallet = await this.walletRepository.getWalletByUserId(userId);
            if (!wallet) {
                throw new Autherror_1.AuthError("Wallet not found.", HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            return wallet;
        }
        catch (error) {
            throw new Autherror_1.AuthError("Failed to fetch wallet: " + error.message, HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IWalletRepository")),
    __metadata("design:paramtypes", [Object])
], WalletService);
//# sourceMappingURL=WalletService.js.map