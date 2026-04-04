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
