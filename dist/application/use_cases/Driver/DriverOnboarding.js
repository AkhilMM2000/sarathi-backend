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
exports.OnboardDriverUseCase = void 0;
const tsyringe_1 = require("tsyringe");
let OnboardDriverUseCase = class OnboardDriverUseCase {
    constructor(stripeService, driverRepository) {
        this.stripeService = stripeService;
        this.driverRepository = driverRepository;
    }
    async execute(email, driverId) {
        const account = await this.stripeService.createExpressAccount(email, driverId);
        await this.driverRepository.updateStripeAccount(driverId, account.id);
        const accountLink = await this.stripeService.createAccountLink(account.id);
        return accountLink.url;
    }
};
exports.OnboardDriverUseCase = OnboardDriverUseCase;
exports.OnboardDriverUseCase = OnboardDriverUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('StripeService')),
    __param(1, (0, tsyringe_1.inject)("IDriverRepository")),
    __metadata("design:paramtypes", [Object, Object])
], OnboardDriverUseCase);
//# sourceMappingURL=DriverOnboarding.js.map