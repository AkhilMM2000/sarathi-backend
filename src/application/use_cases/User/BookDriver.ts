import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository";
import { BookingStatus,Booking, BookingType } from "../../../domain/models/Booking"; 
import { IFareCalculatorService } from "../../services/FareCalculatorService"; 
import { Types } from "mongoose";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";

export interface BookDriverInput {
  userId: string;
  driverId: string;
  fromLocation: string;
  toLocation?: string;
  startDate: Date;
  endDate?: Date;
  estimatedKm?: number;
  bookingType: BookingType
}

@injectable()
export class BookDriver {
  constructor(
    @inject("IBookingRepository") private bookingRepo: IBookingRepository,
    @inject("IFareCalculatorService") private fareCalculator: IFareCalculatorService,
    @inject("INotificationService")
    private notificationService: INotificationService
  ) {}

  async execute(data: BookDriverInput): Promise<Booking> {
    const { driverId, startDate, endDate, bookingType} = data;

if(endDate && startDate > endDate) {
      throw new AuthError("End date must be greater than start date", 400);
    
  
}
    // Step 1: Check if driver is already booked in that range
    const isBooked = await this.bookingRepo.checkDriverAvailability(driverId, startDate, endDate);
  console.log(!isBooked);
  
    if (!isBooked) {
     
    
      
      throw new AuthError("Driver is already booked for the selected time.", 400);
      
    }

    //
    const estimatedFare = this.fareCalculator.calculate({
      bookingType,
      estimatedKm: data.estimatedKm,
      startDate,
      endDate,
    });


    const newBooking: Booking = {
      ...data,
      userId: new Types.ObjectId(data.userId),
      driverId: new Types.ObjectId(data.driverId),
      estimatedFare,
      status: BookingStatus.PENDING,
      paymentMode: "stripe",
    };
   
    // Step 4: Save booking
    const savedBooking = await this.bookingRepo.createBooking(newBooking);
   await this.notificationService.sendBookingNotification(driverId,{startDate,newRide:savedBooking});
    return savedBooking;
  }
}
