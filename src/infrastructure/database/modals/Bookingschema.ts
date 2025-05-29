import mongoose, { Schema, Document } from "mongoose";
import { BookingStatus, BookingType, Booking,paymentStatus } from "../../../domain/models/Booking";

export interface BookingDocument extends Omit<Booking, "id">, Document {} // use "id", not "_id"

const bookingSchema = new Schema<BookingDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true },
    fromLocation: { type: String },
    toLocation: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    estimatedKm: { type: Number },
    finalKm: { type: Number },
    estimatedFare: { type: Number },
    finalFare: { type: Number },
    bookingType: {
      type: String,
      enum: Object.values(BookingType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(paymentStatus),
      default: paymentStatus.PENDING,
    
    },
    
    paymentIntentId: { type: String },
    paymentMode: {
      type: String,
      enum: ["stripe"],
    },
 driver_fee: { type: Number },
    platform_fee: { type: Number },
    reason: { type: String },
    walletDeduction:{type:Number}
  },
 
  {
    timestamps: true,
  }
);

export default mongoose.model<BookingDocument>("Booking", bookingSchema);
