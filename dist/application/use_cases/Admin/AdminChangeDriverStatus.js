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
exports.AdminChangeDriverStatus = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../../domain/errors/Autherror");
const Tokens_1 = require("../../../constants/Tokens");
let AdminChangeDriverStatus = class AdminChangeDriverStatus {
    constructor(driverRepository, notificationService) {
        this.driverRepository = driverRepository;
        this.notificationService = notificationService;
    }
    async execute(driverId, status, reason) {
        if (!["pending", "approved", "rejected"].includes(status)) {
            throw new Autherror_1.AuthError("Invalid status value.", 400); // Bad Request
        }
        if (status === "rejected" && !reason) {
            throw new Autherror_1.AuthError("Rejection reason is required.", 422); // Unprocessable Entity
        }
        await this.notificationService.adminChangeDriverStatusNotification(driverId, { status, reason });
        return await this.driverRepository.updateStatus(driverId, status, reason);
    }
};
exports.AdminChangeDriverStatus = AdminChangeDriverStatus;
exports.AdminChangeDriverStatus = AdminChangeDriverStatus = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __param(1, (0, tsyringe_1.inject)("INotificationService")),
    __metadata("design:paramtypes", [Object, Object])
], AdminChangeDriverStatus);
//# sourceMappingURL=AdminChangeDriverStatus.js.map