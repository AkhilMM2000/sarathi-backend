"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDriverListResponse = exports.toDriverFullResponse = exports.toDriverResponse = void 0;
/**
 * Mapper: Domain Entity -> DriverResponseDto
 */
const toDriverResponse = (driver) => {
    return {
        _id: driver._id?.toString() || "",
        name: driver.name || "",
        email: driver.email || "",
        mobile: driver.mobile || "",
        profileImage: driver.profileImage || "",
        location: driver.location || { latitude: 0, longitude: 0 },
        place: driver.place || "",
        status: driver.status || "pending",
        onlineStatus: driver.onlineStatus || "offline",
        averageRating: driver.averageRating || 0,
        totalRatings: driver.totalRatings || 0,
        distance: driver.distance ?? null,
    };
};
exports.toDriverResponse = toDriverResponse;
/**
 * Mapper: Domain Entity -> DriverFullResponseDto
 */
const toDriverFullResponse = (driver) => {
    return {
        ...(0, exports.toDriverResponse)(driver),
        aadhaarNumber: driver.aadhaarNumber || "",
        licenseNumber: driver.licenseNumber || "",
        aadhaarImage: driver.aadhaarImage || "",
        licenseImage: driver.licenseImage || "",
        stripeAccountId: driver.stripeAccountId || "",
        activePayment: driver.activePayment || false,
    };
};
exports.toDriverFullResponse = toDriverFullResponse;
/**
 * Mapper: Array of Domain Entities -> Array of DriverResponseDto
 */
const toDriverListResponse = (drivers) => {
    return drivers.map(exports.toDriverResponse);
};
exports.toDriverListResponse = toDriverListResponse;
//# sourceMappingURL=DriverResponseDto.js.map