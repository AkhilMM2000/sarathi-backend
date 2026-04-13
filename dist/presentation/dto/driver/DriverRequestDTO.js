"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyAccountSchema = exports.DriverBookingPaginationSchema = exports.UserIdParamSchema = exports.OnboardDriverSchema = exports.EditDriverProfileSchema = exports.ResendDriverOtpSchema = exports.VerifyDriverOtpSchema = exports.DriverLoginSchema = exports.RegisterDriverSchema = void 0;
const zod_1 = require("zod");
/**
 * Driver Registration Schema
 * Validates the core signup fields for the Driver entity
 */
exports.RegisterDriverSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(3, "Name must be at least 3 characters"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    mobile: zod_1.z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
    place: zod_1.z.string().min(1, "Place is required"),
    aadhaarNumber: zod_1.z.string().min(12, "Aadhaar number must be at least 12 digits"),
    licenseNumber: zod_1.z.string().min(1, "License number is required"),
    // These are often relative paths (images/uploads/...) from the client
    profileImage: zod_1.z.string().optional().or(zod_1.z.literal("")),
    aadhaarImage: zod_1.z.string().min(1, "Aadhaar image path is required"),
    licenseImage: zod_1.z.string().min(1, "License image path is required"),
    location: zod_1.z.object({
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number(),
    }),
});
/**
 * Driver Login Schema
 * Reuses the same structure as User but can be extended later if needed
 */
exports.DriverLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    role: zod_1.z.literal("driver"),
});
/**
 * Driver OTP Verification Schema
 */
exports.VerifyDriverOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    otp: zod_1.z.string().length(6, "OTP must be exactly 6 digits"),
});
/**
 * Driver Resend OTP Schema
 */
exports.ResendDriverOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    role: zod_1.z.literal("driver"),
});
/**
 * Edit Driver Profile Schema (Partial Update)
 */
exports.EditDriverProfileSchema = exports.RegisterDriverSchema.partial();
/**
 * Onboard Driver Schema
 */
exports.OnboardDriverSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    driverId: zod_1.z.string().optional(),
});
/**
 * User ID Params Schema
 */
exports.UserIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "User ID is required"),
});
/**
 * Driver Booking Pagination Schema
 */
exports.DriverBookingPaginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).default(2),
});
/**
 * Verify Account Schema
 */
exports.VerifyAccountSchema = zod_1.z.object({
    driverId: zod_1.z.string().min(1, "Driver ID is required"),
});
//# sourceMappingURL=DriverRequestDTO.js.map