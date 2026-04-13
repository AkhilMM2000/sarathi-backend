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
exports.GetDriverDashboardStats = void 0;
const tsyringe_1 = require("tsyringe");
const Tokens_1 = require("../../../constants/Tokens");
let GetDriverDashboardStats = class GetDriverDashboardStats {
    constructor(bookingRepo) {
        this.bookingRepo = bookingRepo;
    }
    async execute(driverId) {
        const rawData = await this.bookingRepo.getDriverDashboardStats(driverId);
        // Default structure if no data exists
        const stats = {
            earnings: {
                today: 0,
                thisWeek: 0,
                total: 0,
            },
            rideStats: {
                completed: 0,
                pending: 0,
                rejected: 0,
                cancelled: 0,
            },
        };
        if (rawData.earnings && rawData.earnings.length > 0) {
            stats.earnings.today = rawData.earnings[0].today || 0;
            stats.earnings.thisWeek = rawData.earnings[0].thisWeek || 0;
            stats.earnings.total = rawData.earnings[0].total || 0;
        }
        if (rawData.rideStats && rawData.rideStats.length > 0) {
            rawData.rideStats.forEach((item) => {
                const status = item._id ? item._id.toLowerCase() : "";
                if (status === "completed")
                    stats.rideStats.completed = item.count;
                else if (status === "pending")
                    stats.rideStats.pending = item.count;
                else if (status === "rejected")
                    stats.rideStats.rejected = item.count;
                else if (status === "cancelled")
                    stats.rideStats.cancelled = item.count;
            });
        }
        return stats;
    }
};
exports.GetDriverDashboardStats = GetDriverDashboardStats;
exports.GetDriverDashboardStats = GetDriverDashboardStats = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IBOOKING_REPO)),
    __metadata("design:paramtypes", [Object])
], GetDriverDashboardStats);
//# sourceMappingURL=GetDriverDashboardStats.js.map