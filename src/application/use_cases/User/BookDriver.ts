import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository";
import { BookingStatus,Booking, BookingType } from "../../../domain/models/Booking"; 
import { IFareCalculatorService } from "../../services/FareCalculatorService"; 
import { Types } from "mongoose";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";
import { TOKENS } from "../../../constants/Tokens";
import { IBookDriverUseCase } from "./interfaces/IBookDriverUseCase";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository";

export interface BookDriverInput {
  userId: string;
  driverId?: string;
  fromLocation: string;
  toLocation?: string;
  startDate: Date;
  endDate?: Date;
  estimatedKm?: number;
  bookingType: BookingType;
  fromLat: number;
  fromLng: number;
}
 
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";

@injectable()
export class BookDriver implements IBookDriverUseCase  {
  constructor(
    @inject(TOKENS.IBOOKING_REPO) private _bookingRepo: IBookingRepository,
    @inject(TOKENS.IDRIVER_REPO) private _driverRepo: IDriverRepository,
    @inject(TOKENS.IFARE_CALCULATE_SERVICE) private _fareCalculator: IFareCalculatorService,
    @inject(TOKENS.NOTIFICATION_SERVICE)
    private _notificationService: INotificationService
  ) {}

  async execute(data: BookDriverInput): Promise<Booking> {
    const { driverId, startDate, endDate, bookingType} = data;

    if(endDate && startDate > endDate) {
      throw new AuthError("End date must be greater than start date", HTTP_STATUS_CODES.BAD_REQUEST);
    }

    // Check availability only if a specific driver was requested
    if (driverId) {
      const isBooked = await this._bookingRepo.checkDriverAvailability(driverId, startDate, endDate);
      if (!isBooked) {
        throw new AuthError("Driver is already booked for the selected time.", HTTP_STATUS_CODES.BAD_REQUEST);
      }
    }

    const estimatedFare = this._fareCalculator.calculate({
      bookingType,
      estimatedKm: data.estimatedKm,
      startDate,
      endDate,
    });

    const nearbyDrivers = await this._driverRepo.findNearbyDriversWithinRadius(
      { latitude: data.fromLat, longitude: data.fromLng },
      [],
      15 // 15 km radius
    );

    // If there are absolutely no online/available drivers, throw an error
    if (nearbyDrivers.length === 0) {
      throw new AuthError("No online drivers available in your 15km area.", HTTP_STATUS_CODES.BAD_REQUEST);
    }

    const newBooking: Booking = {
      userId: new Types.ObjectId(data.userId),
      ...(driverId && { driverId: new Types.ObjectId(driverId) }),
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      startDate: new Date(startDate),
      ...(endDate && { endDate: new Date(endDate) }),
      estimatedKm: data.estimatedKm,
      bookingType,
      estimatedFare,
      status: BookingStatus.PENDING,
      paymentMode: "stripe",
    };
   
    // Save booking
    const savedBooking = await this._bookingRepo.createBooking(newBooking);

    if (savedBooking.driverId) {
      await this._notificationService.sendBookingNotification(savedBooking.driverId.toString(), { startDate, newRide: savedBooking });
    } else {
      const driverIds = nearbyDrivers.map(d => d._id.toString());
      await this._notificationService.broadcastBookingNotification(driverIds, { startDate, newRide: savedBooking });
    }

    return savedBooking;
  }
}
