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
exports.AddVehicle = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../domain/errors/Autherror");
const Tokens_1 = require("../../constants/Tokens");
let AddVehicle = class AddVehicle {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async execute(vehicleData) {
        // List of required fields
        const requiredFields = [
            "userId",
            "vehicleImage",
            "rcBookImage",
            "Register_No",
            "ownerName",
            "vehicleName",
            "vehicleType",
            "polution_expire",
        ];
        // Check if any field is missing
        for (const field of requiredFields) {
            if (!vehicleData[field]) {
                throw new Autherror_1.AuthError(`${field} is required`, 400);
            }
        }
        // Save vehicle if all validations pass
        return await this.vehicleRepository.addVehicle(vehicleData);
    }
};
exports.AddVehicle = AddVehicle;
exports.AddVehicle = AddVehicle = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.VEHICLE_REPO)),
    __metadata("design:paramtypes", [Object])
], AddVehicle);
//# sourceMappingURL=AddVehicle.js.map