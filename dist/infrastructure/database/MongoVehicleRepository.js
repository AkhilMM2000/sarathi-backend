"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoVehicleRepository = void 0;
const VehicleSchema_1 = require("./modals/VehicleSchema");
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
let MongoVehicleRepository = class MongoVehicleRepository {
    async addVehicle(vehicleData) {
        try {
            const vehicle = new VehicleSchema_1.VehicleModel(vehicleData);
            console.log("Before saving:", vehicle);
            const savedVehicle = await vehicle.save();
            console.log("After saving:", savedVehicle);
            return savedVehicle.toObject();
        }
        catch (error) {
            console.error("Error saving vehicle:", error);
            throw error;
        }
    }
    // Edit vehicle details (partial update)
    async editVehicle(vehicleId, updateData) {
        if (!mongoose_1.Types.ObjectId.isValid(vehicleId))
            return null;
        const updatedVehicle = await VehicleSchema_1.VehicleModel.findByIdAndUpdate(vehicleId, updateData, {
            new: true,
            runValidators: true,
        });
        return updatedVehicle ? updatedVehicle.toObject() : null;
    }
    // Get a vehicle by its ID
    async getVehicleById(vehicleId) {
        if (!mongoose_1.Types.ObjectId.isValid(vehicleId))
            return null;
        const vehicle = await VehicleSchema_1.VehicleModel.findById(vehicleId);
        return vehicle ? vehicle.toObject() : null;
    }
    // Get all vehicles registered by a specific user
    async getVehiclesByUser(userId) {
        if (!mongoose_1.Types.ObjectId.isValid(userId))
            return [];
        const vehicles = await VehicleSchema_1.VehicleModel.find({ userId });
        return vehicles.map(vehicle => vehicle.toObject());
    }
    // Delete a vehicle by ID
    async deleteVehicle(vehicleId) {
        if (!mongoose_1.Types.ObjectId.isValid(vehicleId))
            return false;
        const result = await VehicleSchema_1.VehicleModel.findByIdAndDelete(vehicleId);
        return !!result;
    }
    async findAll() {
        return await VehicleSchema_1.VehicleModel.find();
    }
};
exports.MongoVehicleRepository = MongoVehicleRepository;
exports.MongoVehicleRepository = MongoVehicleRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoVehicleRepository);
//# sourceMappingURL=MongoVehicleRepository.js.map