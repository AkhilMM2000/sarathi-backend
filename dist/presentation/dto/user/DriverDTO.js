"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDriverListResponse = exports.toDriverFullResponse = exports.toDriverResponse = void 0;
/**
 * Maps a single Driver (or partial Driver from application layer)
 * to a safe Response DTO for the Public API
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
 * Maps a single Driver to a full Response DTO (includes sensitive docs)
 * Only for self-viewing (Dashboard)
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
 * Maps an array of Drivers to safe Response DTOs
 */
const toDriverListResponse = (drivers) => {
    return drivers.map(exports.toDriverResponse);
};
exports.toDriverListResponse = toDriverListResponse;
//# sourceMappingURL=DriverDTO.js.map