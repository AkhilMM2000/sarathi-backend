import { BookingWithUsername, IBookingRepository, PaginatedResult, rideHistory } from "../../domain/repositories/IBookingrepository"; 
import { Booking, paymentStatus } from "../../domain/models/Booking"; // Domain model
import BookingModel from "./modals/Bookingschema"; // Mongoose model
import { injectable } from "tsyringe";
import { AuthError } from "../../domain/errors/Autherror";
import { log } from "console";
import { STATUS_CODES } from "http";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
@injectable()
export class MongoBookingRepository implements IBookingRepository {
  async createBooking(booking: Booking): Promise<Booking> {
    try {
      const created = await BookingModel.create(booking);
      return created.toObject();
    } catch (err: any) {
      console.error("MongoBookingRepository.createBooking error:", err);
     
      throw new AuthError(`Failed to create booking. Please try again.${err.message}`, 500);
    }
  }
  
    async findBookingById(id: string): Promise<Booking | null> {
      const booking = await BookingModel.findById(id);
      return booking ? booking.toObject() : null;
    }

    async GetAllBookings(page: number, limit: number): Promise<PaginatedResult<BookingWithUsername>> {
      try {
       const skip = (page - 1) * limit;
    
      const [bookings, total] = await Promise.all([
        BookingModel.find()
          .populate("userId", "name profile") 
          .populate("driverId", "name profileImage") 
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        BookingModel.countDocuments(),
      ]);
    
      const formattedBookings: BookingWithUsername[] = bookings.map((b) => {
        const plain = b.toObject() as Booking & { place?: string };
        return {
          ...plain,
          username: (plain.userId as any)?.name || "Unknown", 
          place: plain.place || "N/A", // safely access populated username
          drivername: (plain.driverId as any)?.name|| "Unknown",
          driverImage: (plain.driverId as any)?.profileImage || "N/A", // safely access populated username
           userImage: (plain.userId as any)?.profile || "N/A", // safely access populated username
        };
      });
    
      return {
        data: formattedBookings,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
      } catch (error:any) {
        console.error('Error fetching all bookings:', error.message);
        throw new AuthError(`${error.message}`, 500);
        
      }
    }


  
    async findBookingsByDriver(
  driverId: string,
  page: number,
  limit: number
): Promise<PaginatedResult<rideHistory>> {
  const skip = (page - 1) * limit;
const query: any = {
          driverId,
  status: { $nin: ["CANCELLED", "REJECTED"] },
  paymentStatus: { $ne: "COMPLETED" },
};

  const [bookings, total] = await Promise.all([
    BookingModel.find(query)
      .populate("userId", "name profile email place mobile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    BookingModel.countDocuments(query),
  ]);

  const formattedBookings: rideHistory[] = bookings.map((b) => {
    const bookingObj = b.toObject(); // Convert Mongoose document to plain object
    const user = bookingObj.userId as unknown as {
      name: string;
      place: string;
      email: string;
      profile: string;
      mobile:string
    };

    return {
      ...bookingObj,
      name: user.name,
      place: user.place,
      email: user.email,
      profile: user.profile,
      mobile:user.mobile
    };
  });

  return {
    data: formattedBookings,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

  
    async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
      try {
        const updated = await BookingModel.findByIdAndUpdate(id, updates, { new: true });
        return updated ? updated.toObject() : null;
      } catch (error:any) {
        console.error('Error updating booking:', error.message);
        throw new AuthError(`${error.message}`, 500);
      }
    }
    
      
  
    async checkDriverAvailability(driverId: string, start: Date, end?: Date): Promise<boolean> {
      // If no end date provided, assume it's a one-day booking
      try{
      const effectiveEnd = end || start;
    console.log(effectiveEnd);  
     
const conflict = await BookingModel.findOne({
  driverId,
  status: { $ne: "CANCELLED" },
  $or: [
    {
      // Booking has both startDate and endDate
      startDate: { $lte: effectiveEnd },
      endDate: { $gte: start },
    },
    {
      // Booking has only startDate (no endDate field present)
      startDate: { $eq: effectiveEnd },
      endDate: { $exists: false },
    },
  ],
});
   
      return !conflict;
    }
   catch (error:any) {
    // Optionally, use a logger here
    console.error(`Error checking driver availability for ${driverId}:`, error);

    // costome error handling
    throw new AuthError(`failed to check availability of driver ${error.message}`, 500);
  }
    
  
}
/////////////////////////current working
async findBookingsByUser(userId: string, page: number, limit: number): Promise<PaginatedResult<BookingWithUsername>> {
  try {
    const skip = (page - 1) * limit;
    const query: any = {
          userId,
  status: { $nin: ["CANCELLED", "REJECTED"] },
  paymentStatus: { $ne: "COMPLETED" },
};
    const [bookings, total] = await Promise.all([
      BookingModel.find(query)
        .populate("userId", "name") 
        .populate("driverId", "name profileImage mobile")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BookingModel.countDocuments(query),
    ]);
  
    const formattedBookings: BookingWithUsername[] = bookings.map((b) => {
      const plain = b.toObject() as Booking & { place?: string };
      return {
        ...plain,
        username: (plain.userId as any)?.name || "Unknown", 
        place: plain.place || "N/A", // safely access populated username
        drivername: (plain.driverId as any)?.name || "Unknown",
         driverImage: (plain.driverId as any)?.profileImage || "N/A", // safely access populated username
     
      };
    });
  
    return {
      data: formattedBookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err: any) {
    console.error("MongoBookingRepository.findBookingsByUser error:", err);
    throw new AuthError(`Failed to fetch user bookings. ${err.message}`, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
}
async getRideHistoryByRole(
  id: string,
  role: 'user' | 'driver',
  page: number,
  limit: number
): Promise<PaginatedResult<rideHistory>> {
  try {
    const skip = (page - 1) * limit;

    // Step 1: Construct dynamic query
    const query: any = {
      $or: [
        { status: { $in: ["CANCELLED", "REJECTED"] } },
        { paymentStatus: "COMPLETED" },
      ],
    };

    if (role === "user") {
      query.userId = id;
    } else if (role === "driver") {
      query.driverId = id;
    }

  
    // Step 2: Determine which field to populate
    const populateField = role === "user" ? "driverId":"userId" ;
    const projection = role === "user" ?  "name email profileImage place":"name email profile place" 
    const total = await BookingModel.countDocuments(query);

    const rides = await BookingModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate(populateField,projection)
      .lean();

    // Step 3: Transform based on role
    const transformed: rideHistory[] = rides.map((b) => {
      const person = role === "user" ?  (b.driverId as any):(b.userId as any) 
      return {
        ...b,
        email: person?.email,
        place: person?.place,
        name: person?.name,
        profile: role === "user" ? person?.profileImage:person?.profile ,
      };
    });

    return {
      data: transformed,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error: any) {
    console.log(error.message);
    throw new AuthError(
      `Failed to fetch ${role} ride history. ${error.message}`,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
}


  }