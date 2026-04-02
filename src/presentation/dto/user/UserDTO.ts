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
 * User Response Mapper
 * Filters out sensitive database fields before sending as JSON
 */
export const toUserResponse = (user: User) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, googleId, ...safeUser } = user;
  return safeUser;
};
