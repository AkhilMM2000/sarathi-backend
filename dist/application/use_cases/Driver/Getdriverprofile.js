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
exports.GetDriverProfile = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../../domain/errors/Autherror");
const Tokens_1 = require("../../../constants/Tokens");
let GetDriverProfile = class GetDriverProfile {
    constructor(driverRepository) {
        this.driverRepository = driverRepository;
    }
    async execute(driverId) {
        if (!driverId) {
            throw new Autherror_1.AuthError("Driver ID is required", 400);
        }
        const driver = await this.driverRepository.findDriverById(driverId);
        if (!driver) {
            throw new Autherror_1.AuthError("Driver not found", 404);
        }
        return driver;
    }
};
exports.GetDriverProfile = GetDriverProfile;
exports.GetDriverProfile = GetDriverProfile = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __metadata("design:paramtypes", [Object])
], GetDriverProfile);
//# sourceMappingURL=Getdriverprofile.js.map