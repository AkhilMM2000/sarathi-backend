"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserResponse = exports.VehicleIdParamSchema = exports.EditVehicleSchema = exports.AddVehicleSchema = exports.SubmitReviewSchema = exports.WalletPaginationSchema = exports.CreatePaymentIntentSchema = exports.GetNearbyDriverQuerySchema = exports.DriverIdParamSchema = exports.FetchDriversSchema = exports.UpdateUserSchema = exports.ResendOtpSchema = exports.LoginSchema = exports.VerifyOtpSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
const Vehicle_1 = require("../../../domain/models/Vehicle");
/**
 * Register User Schema
 * Validates the core signup fields for the User entity
 */
exports.RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Name must be at least 3 characters"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    mobile: zod_1.z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
});
/**
 * Verify OTP Schema
 */
exports.VerifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    otp: zod_1.z.string().length(6, "OTP must be exactly 6 digits"),
});
/**
 * Login User Schema
 */
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(1, "Password is required"),
    role: zod_1.z.enum(["user", "admin", "driver"], {
        message: "Role must be user, admin, or driver",
    }),
});
/**
 * Resend OTP Schema
 */
exports.ResendOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    role: zod_1.z.enum(["user", "admin", "driver"], {
        message: "Role must be user, admin, or driver",
    }),
});
/**
 * Update User Schema
 * Allows partial updates of secondary fields only
 */
exports.UpdateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Name must be at least 3 characters").optional(),
    email: zod_1.z.string().email("Invalid email format").optional(),
    mobile: zod_1.z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits").optional(),
    profile: zod_1.z.string().optional(),
    location: zod_1.z.object({
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number(),
    }).optional(),
    place: zod_1.z.string().optional(),
});
/**
 * Helper to ensure query params are single values even if multiple are sent
 */
const coerceToSingle = (val) => (Array.isArray(val) ? val[0] : val);
/**
 * Fetch Drivers Query Schema
 * Handles pagination and search parameters from query string
 */
exports.FetchDriversSchema = zod_1.z.object({
    page: zod_1.z.preprocess(coerceToSingle, zod_1.z.coerce.number().min(1).default(1)),
    limit: zod_1.z.preprocess(coerceToSingle, zod_1.z.coerce.number().min(1).max(50).default(10)),
    search: zod_1.z.preprocess(coerceToSingle, zod_1.z.string().optional().default("")),
    lat: zod_1.z.preprocess(coerceToSingle, zod_1.z.coerce.number().optional()),
    lng: zod_1.z.preprocess(coerceToSingle, zod_1.z.coerce.number().optional()),
});
/**
 * Driver Params Schema
 * Validates driverId from req.params
 */
exports.DriverIdParamSchema = zod_1.z.object({
    driverId: zod_1.z.string().min(1, "Driver ID is required"),
});
/**
 * Get Nearby Driver Details Query Schema
 */
exports.GetNearbyDriverQuerySchema = zod_1.z.object({
    lat: zod_1.z.preprocess(coerceToSingle, zod_1.z.coerce.number().optional()),
    lng: zod_1.z.preprocess(coerceToSingle, zod_1.z.coerce.number().optional()),
});
/**
 * Payment Intent Request Schema
 */
exports.CreatePaymentIntentSchema = zod_1.z.object({
    amount: zod_1.z.number().positive("Amount must be greater than zero"),
    driverId: zod_1.z.union([
        zod_1.z.string().min(1),
        zod_1.z.object({ _id: zod_1.z.string().min(1) }).transform((obj) => obj._id),
    ]),
});
/**
 * Wallet History Pagination Schema
 * Coerces query strings (page, limit) to numbers
 */
exports.WalletPaginationSchema = zod_1.z.object({
    page: zod_1.z.preprocess(coerceToSingle, zod_1.z.coerce.number().min(1).default(1)),
    limit: zod_1.z.preprocess(coerceToSingle, zod_1.z.coerce.number().min(1).max(50).default(10)),
});
/**
 * Driver Review Request Schema
 */
exports.SubmitReviewSchema = zod_1.z.object({
    driverId: zod_1.z.string().min(1, "Driver ID is required"),
    rideId: zod_1.z.string().min(1, "Ride ID is required"),
    rating: zod_1.z.number().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
    review: zod_1.z.string().optional(),
});
/**
 * Add Vehicle Request Schema
 */
exports.AddVehicleSchema = zod_1.z.object({
    vehicleImage: zod_1.z.string().min(1, "Vehicle Image is required"),
    rcBookImage: zod_1.z.string().min(1, "RC Book Image is required"),
    Register_No: zod_1.z.string().min(1, "Register number is required"),
    ownerName: zod_1.z.string().min(1, "Owner name is required"),
    vehicleName: zod_1.z.string().min(1, "Vehicle name is required"),
    vehicleType: zod_1.z.nativeEnum(Vehicle_1.VehicleType),
    polution_expire: zod_1.z.coerce.date(),
});
/**
 * Edit Vehicle Request Schema (Partial Update)
 */
exports.EditVehicleSchema = exports.AddVehicleSchema.partial();
/**
 * Vehicle ID Params Schema
 */
exports.VehicleIdParamSchema = zod_1.z.object({
    vehicleId: zod_1.z.string().min(1, "Vehicle ID is required"),
});
/**
 * User Response Mapper
 * Filters out sensitive database fields before sending as JSON
 */
const toUserResponse = (user) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, googleId, ...safeUser } = user;
    return {
        ...safeUser,
        _id: user._id?.toString() || "",
    };
};
exports.toUserResponse = toUserResponse;
//# sourceMappingURL=UserDTO.js.map