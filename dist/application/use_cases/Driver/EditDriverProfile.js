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
exports.EditDriverProfile = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../../domain/errors/Autherror");
const Tokens_1 = require("../../../constants/Tokens");
const ErrorMessages_1 = require("../../../constants/ErrorMessages");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
const DriverResponseDto_1 = require("../../dto/driver/DriverResponseDto");
let EditDriverProfile = class EditDriverProfile {
    constructor(_driverRepository) {
        this._driverRepository = _driverRepository;
    }
    async execute(driverId, updateData) {
        if (!driverId) {
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.DRIVER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
        }
        const existingDriver = await this._driverRepository.findDriverById(driverId);
        if (!existingDriver) {
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.DRIVER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
        }
        const updatedDriver = await this._driverRepository.update(driverId, updateData);
        if (!updatedDriver)
            return null;
        return (0, DriverResponseDto_1.toDriverFullResponse)(updatedDriver);
    }
};
exports.EditDriverProfile = EditDriverProfile;
exports.EditDriverProfile = EditDriverProfile = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __metadata("design:paramtypes", [Object])
], EditDriverProfile);
//# sourceMappingURL=EditDriverProfile.js.map