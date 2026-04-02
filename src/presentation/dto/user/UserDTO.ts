import { z } from "zod";
import { User } from "../../../domain/models/User";

/**
 * Register User Schema
 * Validates the core signup fields for the User entity
 */
export const RegisterSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
});

/**
 * Verify OTP Schema
 */
export const VerifyOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

/**
 * Login User Schema
 */
export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["user", "admin", "driver"] as const, {
    message: "Role must be user, admin, or driver",
  }),
});

/**
 * Resend OTP Schema
 */
export const ResendOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["user", "admin", "driver"] as const, {
    message: "Role must be user, admin, or driver",
  }),
});

/**
 * Update User Schema
 * Allows partial updates of secondary fields only
 */
export const UpdateUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits").optional(),
  profile: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  place: z.string().optional(),
});

/**
 * User Response Mapper
 * Filters out sensitive database fields before sending as JSON
 */
export const toUserResponse = (user: User) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, googleId, ...safeUser } = user;
  return safeUser;
};
