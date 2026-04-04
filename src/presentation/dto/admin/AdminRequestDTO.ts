import { z } from "zod";

/**
 * Admin Login Request Schema
 */
export const AdminLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
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
  status: z.string().min(1, "Status is required"),
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
