import { z } from "zod";

/**
 * Helper to ensure query params are single values even if multiple are sent
 */
const coerceToSingle = (val: any) => (Array.isArray(val) ? val[0] : val);

/**
 * Admin Login Request Schema
 */
export const AdminLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "driver", "admin"]),
});

export type AdminLoginRequest = z.infer<typeof AdminLoginSchema>;

/**
 * User ID Param Schema
 */
export const UserIdParamSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

/**
 * Update User Status Schema
 */
export const UpdateUserStatusSchema = z.object({
  isBlock: z.boolean({
    required_error: "isBlock is required",
    invalid_type_error: "isBlock must be a boolean",
  }),
});

/**
 * Driver ID Param Schema
 */
export const DriverIdParamSchema = z.object({
  driverId: z.string().min(1, "Driver ID is required"),
});

/**
 * Change Driver Status Schema (Approval/Rejection)
 */
export const ChangeDriverStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"], {
    required_error: "Status is required",
    invalid_type_error: "Invalid status value",
  }),
  reason: z.string().optional(),
});

/**
 * Handle Block Status Schema (Driver)
 */
export const HandleBlockStatusSchema = z.object({
  isBlock: z.boolean({
    required_error: "isBlock is required",
    invalid_type_error: "isBlock must be a boolean",
  }),
});

/**
 * Admin User Pagination Schema
 */
export const AdminUserPaginationSchema = z.object({
  page: z.preprocess(coerceToSingle, z.coerce.number().min(1).default(1)),
  limit: z.preprocess(coerceToSingle, z.coerce.number().min(1).max(100).default(10)),
});

export type AdminUserPaginationRequest = z.infer<typeof AdminUserPaginationSchema>;
