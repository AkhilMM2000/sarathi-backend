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
exports.GetAdminDashboardStats = void 0;
const tsyringe_1 = require("tsyringe");
const Tokens_1 = require("../../../constants/Tokens");
let GetAdminDashboardStats = class GetAdminDashboardStats {
    constructor(_bookingRepo) {
        this._bookingRepo = _bookingRepo;
    }
    async execute() {
        const rawStats = await this._bookingRepo.getAdminDashboardStats();
        // Default response structure to prevent frontend crashes
        const defaultStats = {
            earnings: {
                today: 0,
                thisWeek: 0,
                total: 0
            },
            finance: {
                totalRevenue: 0,
                totalDriverPayout: 0,
                totalPlatformProfit: 0
            },
            rideStats: {
                completed: 0,
                pending: 0,
                rejected: 0,
                cancelled: 0
            },
            earningsTrend: []
        };
        if (!rawStats)
            return defaultStats;
        // 1. Process Finance & Earnings (platform_fee only where completed)
        const finance = rawStats.finance?.[0] || {};
        defaultStats.earnings = {
            today: finance.todayPlatformProfit || 0,
            thisWeek: finance.weekPlatformProfit || 0,
            total: finance.totalPlatformProfit || 0
        };
        defaultStats.finance = {
            totalRevenue: finance.totalRevenue || 0,
            totalDriverPayout: finance.totalDriverPayout || 0,
            totalPlatformProfit: finance.totalPlatformProfit || 0
        };
        // 2. Process Ride Stats with normalization (Mongo _id -> lowercase keys)
        rawStats.rideStats?.forEach((stat) => {
            const status = stat._id?.toLowerCase();
            if (status && status in defaultStats.rideStats) {
                defaultStats.rideStats[status] = stat.count || 0;
            }
        });
        // 3. Process Trend Data for professional graph visualization
        defaultStats.earningsTrend = rawStats.earningsTrend?.map((item) => ({
            date: item._id,
            earnings: item.earnings || 0
        })) || [];
        return defaultStats;
    }
};
exports.GetAdminDashboardStats = GetAdminDashboardStats;
exports.GetAdminDashboardStats = GetAdminDashboardStats = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IBOOKING_REPO)),
    __metadata("design:paramtypes", [Object])
], GetAdminDashboardStats);
//# sourceMappingURL=GetAdminDashboardStats.js.map