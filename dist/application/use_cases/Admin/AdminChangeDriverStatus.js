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
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
const AdminResponseDto_1 = require("../../dto/admin/AdminResponseDto");
let AdminChangeDriverStatus = class AdminChangeDriverStatus {
    constructor(_driverRepository, _notificationService) {
        this._driverRepository = _driverRepository;
        this._notificationService = _notificationService;
    }
    async execute(driverId, status, reason) {
        if (!["pending", "approved", "rejected"].includes(status)) {
            throw new Autherror_1.AuthError("Invalid status value.", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
        }
        if (status === "rejected" && !reason) {
            throw new Autherror_1.AuthError("Rejection reason is required.", HttpStatusCode_1.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY);
        }
        await this._notificationService.adminChangeDriverStatusNotification(driverId, { status, reason });
        const updatedDriver = await this._driverRepository.updateStatus(driverId, status, reason);
        return updatedDriver ? (0, AdminResponseDto_1.toAdminDriverResponse)(updatedDriver) : null;
    }
};
exports.AdminChangeDriverStatus = AdminChangeDriverStatus;
exports.AdminChangeDriverStatus = AdminChangeDriverStatus = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.NOTIFICATION_SERVICE)),
    __metadata("design:paramtypes", [Object, Object])
], AdminChangeDriverStatus);
//# sourceMappingURL=AdminChangeDriverStatus.js.map