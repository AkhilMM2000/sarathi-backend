"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordSchema = exports.LogoutSchema = exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.RefreshTokenSchema = exports.RoleEnum = void 0;
const zod_1 = require("zod");
/**
 * Helper to ensure query params are single values even if multiple are sent
 */
const coerceToSingle = (val) => (Array.isArray(val) ? val[0] : val);
/**
 * Common Role Enum
 */
exports.RoleEnum = zod_1.z.enum(["user", "driver", "admin"], {
    message: "Role must be user, driver, or admin",
});
/**
 * Refresh Token Request Schema
 */
exports.RefreshTokenSchema = zod_1.z.object({
    role: exports.RoleEnum,
});
/**
 * Forgot Password Request Schema
 */
exports.ForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    role: exports.RoleEnum,
});
/**
 * Reset Password Request Schema
 */
exports.ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token is required"),
    newPassword: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    role: exports.RoleEnum,
});
/**
 * Logout Request Schema (Query Params)
 */
exports.LogoutSchema = zod_1.z.object({
    role: zod_1.z.preprocess(coerceToSingle, exports.RoleEnum),
});
/**
 * Change Password Request Schema
 */
exports.ChangePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1, "Old password is required"),
    newPassword: zod_1.z.string().min(6, "New password must be at least 6 characters"),
    role: exports.RoleEnum,
});
//# sourceMappingURL=AuthRequestDTO.js.map