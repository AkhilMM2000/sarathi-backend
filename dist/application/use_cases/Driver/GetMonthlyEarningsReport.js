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
exports.GetDriverEarningsSummary = void 0;
const tsyringe_1 = require("tsyringe");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
const Autherror_1 = require("../../../domain/errors/Autherror");
const ErrorMessages_1 = require("../../../constants/ErrorMessages");
let GetDriverEarningsSummary = class GetDriverEarningsSummary {
    constructor(bookingRepo) {
        this.bookingRepo = bookingRepo;
    }
    async execute(driverId, year, month) {
        try {
            return await this.bookingRepo.getDriverEarningsByMonth(driverId, year, month);
        }
        catch (error) {
            console.error('GetDriverEarningsSummary Use Case Error:', error.message);
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.BOOKING_EARNINGS_SUMMARY_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.GetDriverEarningsSummary = GetDriverEarningsSummary;
exports.GetDriverEarningsSummary = GetDriverEarningsSummary = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IBookingRepository')),
    __metadata("design:paramtypes", [Object])
], GetDriverEarningsSummary);
//# sourceMappingURL=GetMonthlyEarningsReport.js.map