"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toWalletTransactionHistoryResponse = exports.toWalletTransactionResponse = void 0;
const toWalletTransactionResponse = (transaction) => {
    return {
        transactionId: transaction.transactionId || "",
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
        createdAt: transaction.createdAt || new Date(),
    };
};
exports.toWalletTransactionResponse = toWalletTransactionResponse;
const toWalletTransactionHistoryResponse = (transactions, total, page, limit) => {
    return {
        transactions: transactions.map(exports.toWalletTransactionResponse),
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};
exports.toWalletTransactionHistoryResponse = toWalletTransactionHistoryResponse;
//# sourceMappingURL=WalletDto.js.map