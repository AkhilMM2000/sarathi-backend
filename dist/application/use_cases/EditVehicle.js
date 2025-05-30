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
exports.EditVehicle = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../domain/errors/Autherror");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
let EditVehicle = class EditVehicle {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute(vehicleId, updateData) {
        if (!vehicleId) {
            throw new Autherror_1.AuthError("Vehicle ID is required", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
        }
        const updatedVehicle = await this.vehicleRepository.editVehicle(vehicleId, updateData);
        if (!updatedVehicle) {
            throw new Autherror_1.AuthError("Vehicle not found or update failed", HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
        }
        return updatedVehicle;
    }
};
exports.EditVehicle = EditVehicle;
exports.EditVehicle = EditVehicle = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IVehicleRepository")),
    __metadata("design:paramtypes", [Object])
], EditVehicle);
//# sourceMappingURL=EditVehicle.js.map