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
exports.GetBookingStatusSummary = void 0;
const tsyringe_1 = require("tsyringe");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
const Autherror_1 = require("../../../domain/errors/Autherror");
let GetBookingStatusSummary = class GetBookingStatusSummary {
    constructor(bookingRepo) {
        this.bookingRepo = bookingRepo;
    }
    async execute(driverId, year, month) {
        try {
            return await this.bookingRepo.countBookingsByStatus(driverId, year, month);
        }
        catch (error) {
            console.error('GetBookingStatusSummary Use Case Error:', error.message);
            throw new Autherror_1.AuthError('Unable to fetch booking status summary', HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.GetBookingStatusSummary = GetBookingStatusSummary;
exports.GetBookingStatusSummary = GetBookingStatusSummary = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IBookingRepository')),
    __metadata("design:paramtypes", [Object])
], GetBookingStatusSummary);
//# sourceMappingURL=GetBookingStatusSummary.js.map