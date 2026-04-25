"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toVehicleListResponse = exports.toVehicleResponse = void 0;
/**
 * Mapper: Domain Entity -> VehicleResponseDto
 */
const toVehicleResponse = (vehicle) => {
    return {
        _id: vehicle._id?.toString() || "",
        userId: vehicle.userId?.toString() || "",
        vehicleImage: vehicle.vehicleImage || "",
        rcBookImage: vehicle.rcBookImage || "",
        Register_No: vehicle.Register_No || "",
        ownerName: vehicle.ownerName || "",
        vehicleName: vehicle.vehicleName || "",
        vehicleType: vehicle.vehicleType || "",
        polution_expire: vehicle.polution_expire ? vehicle.polution_expire.toISOString() : "",
    };
};
exports.toVehicleResponse = toVehicleResponse;
/**
 * Mapper: Array of Domain Entities -> Array of VehicleResponseDto
 */
const toVehicleListResponse = (vehicles) => {
    return vehicles.map(exports.toVehicleResponse);
};
exports.toVehicleListResponse = toVehicleListResponse;
//# sourceMappingURL=VehicleResponseDto.js.map