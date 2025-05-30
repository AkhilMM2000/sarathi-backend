"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const tsyringe_1 = require("tsyringe");
const stripe_1 = __importDefault(require("stripe"));
const Autherror_1 = require("../../domain/errors/Autherror");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil'
});
let StripeService = class StripeService {
    async createExpressAccount(email, driverId) {
        try {
            return await stripe.accounts.create({
                type: 'express',
                country: 'US',
                email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    driver_id: driverId,
                },
            });
        }
        catch (error) {
            console.error('Stripe account creation failed:', error);
            throw new Autherror_1.AuthError(`${error.message}`, 500);
        }
    }
    async createAccountLink(accountId) {
        try {
            return await stripe.accountLinks.create({
                account: accountId,
                refresh_url: 'http://localhost:5173/driver/onboard-failure',
                return_url: 'http://localhost:5173/driver/onboard-success',
                type: 'account_onboarding'
            });
        }
        catch (error) {
            console.log(error);
            throw new Autherror_1.AuthError(`${error.message}`, 500);
        }
    }
    async retrieveAccount(accountId) {
        try {
            return await stripe.accounts.retrieve(accountId);
        }
        catch (err) {
            console.error('Stripe retrieve failed:', err);
            throw new Autherror_1.AuthError(err.message, 500);
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, tsyringe_1.injectable)()
], StripeService);
//# sourceMappingURL=Accountservice.js.map