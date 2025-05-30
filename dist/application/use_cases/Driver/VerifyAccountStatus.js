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
exports.VerifyDriverPaymentAccount = void 0;
// src/application/use_cases/VerifyDriverPaymentAccount.ts
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../../domain/errors/Autherror");
let VerifyDriverPaymentAccount = class VerifyDriverPaymentAccount {
    constructor(stripeService, driverRepository) {
        this.stripeService = stripeService;
        this.driverRepository = driverRepository;
    }
    async execute(driverId) {
        const driver = await this.driverRepository.findDriverById(driverId);
        if (!driver || !driver.stripeAccountId) {
            throw new Autherror_1.AuthError('Driver not found or Stripe account ID missing', 404);
        }
        const account = await this.stripeService.retrieveAccount(driver.stripeAccountId);
        // console.log('Account:', account);
        console.log(account.charges_enabled, account.payouts_enabled);
        if (account.charges_enabled && account.payouts_enabled) {
            await this.driverRepository.update(driverId, { activePayment: true });
        }
        else {
            await this.driverRepository.update(driverId, { stripeAccountId: '' });
            throw new Autherror_1.AuthError('Stripe account not yet fully activated', 400);
        }
    }
};
exports.VerifyDriverPaymentAccount = VerifyDriverPaymentAccount;
exports.VerifyDriverPaymentAccount = VerifyDriverPaymentAccount = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('StripeService')),
    __param(1, (0, tsyringe_1.inject)("IDriverRepository")),
    __metadata("design:paramtypes", [Object, Object])
], VerifyDriverPaymentAccount);
//# sourceMappingURL=VerifyAccountStatus.js.map