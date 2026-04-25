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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoVehicleRepository = void 0;
const VehicleSchema_1 = require("./modals/VehicleSchema");
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const BaseRepository_1 = require("./BaseRepository");
let MongoVehicleRepository = class MongoVehicleRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(VehicleSchema_1.VehicleModel);
    }
    async addVehicle(vehicleData) {
        return super.create(vehicleData);
    }
    // Edit vehicle details (partial update)
    async editVehicle(vehicleId, updateData) {
        if (!mongoose_1.Types.ObjectId.isValid(vehicleId))
            return null;
        return super.update(vehicleId, updateData);
    }
    // Get a vehicle by its ID
    async getVehicleById(vehicleId) {
        if (!mongoose_1.Types.ObjectId.isValid(vehicleId))
            return null;
        return super.findById(vehicleId);
    }
    // Get all vehicles registered by a specific user
    async getVehiclesByUser(userId) {
        if (!mongoose_1.Types.ObjectId.isValid(userId))
            return [];
        return super.findAll({ userId });
    }
    // Delete a vehicle by ID
    async deleteVehicle(vehicleId) {
        if (!mongoose_1.Types.ObjectId.isValid(vehicleId))
            return false;
        return super.delete(vehicleId);
    }
};
exports.MongoVehicleRepository = MongoVehicleRepository;
exports.MongoVehicleRepository = MongoVehicleRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoVehicleRepository);
//# sourceMappingURL=MongoVehicleRepository.js.map