"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPaginationSchema = exports.HandleBlockStatusSchema = exports.ChangeDriverStatusSchema = exports.DriverIdParamSchema = exports.UpdateUserStatusSchema = exports.UserIdParamSchema = exports.AdminLoginSchema = void 0;
const zod_1 = require("zod");
/**
 * Helper to ensure query params are single values even if multiple are sent
 */
const coerceToSingle = (val) => (Array.isArray(val) ? val[0] : val);
/**
 * Admin Login Request Schema
 */
exports.AdminLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    role: zod_1.z.enum(["user", "driver", "admin"], {
        message: "Role must be user, driver, or admin",
    }),
});
/**
 * User ID Param Schema
 */
exports.UserIdParamSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, "User ID is required"),
});
/**
 * Update User Status Schema
 */
exports.UpdateUserStatusSchema = zod_1.z.object({
    isBlock: zod_1.z.boolean({
        error: (issue) => issue.input === undefined
            ? "isBlock is required"
            : "isBlock must be a boolean",
    }),
});
/**
 * Driver ID Param Schema
 */
exports.DriverIdParamSchema = zod_1.z.object({
    driverId: zod_1.z.string().min(1, "Driver ID is required"),
});
/**
 * Change Driver Status Schema (Approval/Rejection)
 */
exports.ChangeDriverStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["pending", "approved", "rejected"], {
        message: "Status must be pending, approved, or rejected",
    }),
    reason: zod_1.z.string().optional(),
});
/**
 * Handle Block Status Schema (Driver)
 */
exports.HandleBlockStatusSchema = zod_1.z.object({
    isBlock: zod_1.z.boolean({
        error: (issue) => issue.input === undefined
            ? "isBlock is required"
            : "isBlock must be a boolean",
    }),
});
/**
 * Generic Admin Pagination Schema
 */
exports.AdminPaginationSchema = zod_1.z.object({
    page: zod_1.z.preprocess(coerceToSingle, zod_1.z.coerce.number().min(1).default(1)),
    limit: zod_1.z.preprocess(coerceToSingle, zod_1.z.coerce.number().min(1).max(100).default(10)),
});
//# sourceMappingURL=AdminRequestDTO.js.map