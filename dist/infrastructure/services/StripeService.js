"use strict";
// src/infrastructure/services/StripeService.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../domain/errors/Autherror");
let PaymentService = class PaymentService {
    constructor() {
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-03-31.basil',
        });
    }
    async createPaymentIntent({ amount, driverStripeAccountId, platformFee, }) {
        try {
            const account = await this.stripe.accounts.retrieve(driverStripeAccountId);
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount,
                currency: 'inr', // Use INR for testing
                automatic_payment_methods: { enabled: true }, // Supports cards, Google Pay, etc.
                application_fee_amount: platformFee, // Platform fee (10%)
                transfer_data: {
                    destination: driverStripeAccountId, // Transfer to the driver’s connected account
                },
            });
            return { clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id, };
        }
        catch (err) {
            console.error('Stripe Payment Intent Creation Error:', err.message);
            throw new Autherror_1.AuthError(`${err.message}`, 500);
        }
    }
    async retrievePaymentIntent(paymentIntentId) {
        return this.stripe.paymentIntents.retrieve(paymentIntentId);
    }
    async transferToDriverFromWallet(rideId, amount, // in rupees
    driverStripeAccountId) {
        try {
            // Convert to paisa
            const transferAmount = Math.floor(0.9 * amount * 100);
            // Retrieve current platform balance
            const balance = await this.stripe.balance.retrieve();
            console.log(balance, 'balance');
            const usdBalance = balance.pending.find(b => b.currency === 'usd')?.amount || 0;
            console.log(usdBalance, 'usdBalance');
            const inrBalance = Math.floor(usdBalance * 85.62);
            if (inrBalance < transferAmount) {
                throw new Autherror_1.AuthError('Insufficient platform balance to transfer funds to driver.', 400);
            }
            // Perform the transfer
            const transfer = await this.stripe.transfers.create({
                amount: transferAmount,
                currency: 'inr',
                destination: driverStripeAccountId,
                transfer_group: rideId,
            });
            return transfer;
        }
        catch (err) {
            console.error('Stripe Wallet Transfer Error:', err.message);
            throw new Autherror_1.AuthError(`${err.message}`, 500);
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], PaymentService);
//# sourceMappingURL=StripeService.js.map