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
exports.CreatePaymentIntent = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../../domain/errors/Autherror");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
const Tokens_1 = require("../../../constants/Tokens");
let CreatePaymentIntent = class CreatePaymentIntent {
    constructor(stripeService, driverRepository) {
        this.stripeService = stripeService;
        this.driverRepository = driverRepository;
    }
    async execute({ amount, driverId, }) {
        const platformFee = Math.floor(amount * 0.1); // 10% platform fee
        const driver = await this.driverRepository.findDriverById(driverId);
        console.log(driver, 'driver');
        console.log(driver?.stripeAccountId);
        if (driver) {
            if (!driver.stripeAccountId) {
                throw new Autherror_1.AuthError("Driver not found or not onboarded", HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
        }
        return await this.stripeService.createPaymentIntent({
            amount,
            driverStripeAccountId: driver?.stripeAccountId || '',
            platformFee,
        });
    }
};
exports.CreatePaymentIntent = CreatePaymentIntent;
exports.CreatePaymentIntent = CreatePaymentIntent = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('StripePaymentService')),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __metadata("design:paramtypes", [Object, Object])
], CreatePaymentIntent);
//# sourceMappingURL=CreatePaymentIntent.js.map