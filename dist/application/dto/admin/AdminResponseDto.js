"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAdminUserListResponse = exports.toAdminDriverListResponse = exports.toAdminDriverResponse = exports.toAdminUserResponse = void 0;
/**
 * Mappers
 */
const toAdminUserResponse = (user) => {
    return {
        _id: user._id?.toString() || "",
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        profileImage: user.profile || "",
        isBlock: !!user.isBlock,
        vehicleCount: user.vehicleCount || 0,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt)
    };
};
exports.toAdminUserResponse = toAdminUserResponse;
const toAdminDriverResponse = (driver) => {
    return {
        _id: driver._id?.toString() || "",
        name: driver.name || "",
        email: driver.email || "",
        mobile: driver.mobile || "",
        profileImage: driver.profileImage || "",
        status: driver.status || "pending",
        onlineStatus: driver.onlineStatus || "offline",
        isBlock: driver.isBlock || false,
        place: driver.place || "",
        averageRating: driver.averageRating || 0,
        totalRatings: driver.totalRatings || 0,
        aadhaarNumber: driver.aadhaarNumber || "",
        licenseNumber: driver.licenseNumber || "",
        aadhaarImage: driver.aadhaarImage || "",
        licenseImage: driver.licenseImage || "",
        createdAt: driver.createdAt instanceof Date ? driver.createdAt.toISOString() : String(driver.createdAt)
    };
};
exports.toAdminDriverResponse = toAdminDriverResponse;
const toAdminDriverListResponse = (drivers) => {
    return drivers.map(exports.toAdminDriverResponse);
};
exports.toAdminDriverListResponse = toAdminDriverListResponse;
const toAdminUserListResponse = (users) => {
    return users.map(exports.toAdminUserResponse);
};
exports.toAdminUserListResponse = toAdminUserListResponse;
//# sourceMappingURL=AdminResponseDto.js.map