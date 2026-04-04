import { z } from "zod";
import { BookingType } from "../../../domain/models/Booking";

/**
 * Book Driver Request Schema
 * Handles validation and date coercion for the initial booking request
 */
export const BookDriverSchema = z.object({
  driverId: z.string().min(1, "Driver ID is required"),
  fromLocation: z.string().min(1, "From location is required"),
  toLocation: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  estimatedKm: z.number().nonnegative().optional(),
  bookingType: z.nativeEnum(BookingType),
}).refine((data) => {
  if (data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type BookDriverRequest = z.infer<typeof BookDriverSchema>;

/**
 * Get Estimated Fare Request Schema
 */
export const GetEstimatedFareSchema = z.object({
  bookingType: z.nativeEnum(BookingType),
  estimatedKm: z.number().nonnegative().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export type GetEstimatedFareRequest = z.infer<typeof GetEstimatedFareSchema>;

/**
 * User Booking Pagination Schema (Query Params)
 */
export const UserBookingPaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export type UserBookingPaginationRequest = z.infer<typeof UserBookingPaginationSchema>;

/**
 * Attach Payment Intent Schema
 */
export const AttachPaymentIntentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment Intent ID is required"),
  paymentStatus: z.string().min(1, "Payment Status is required"),
  walletDeduction: z.number().nonnegative().optional().default(0),
});

export type AttachPaymentIntentRequest = z.infer<typeof AttachPaymentIntentSchema>;

/**
 * Booking ID Params Schema
 */
export const BookingIdParamSchema = z.object({
  rideId: z.string().min(1, "Ride ID is required"),
});
