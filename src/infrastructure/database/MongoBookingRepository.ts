import { BookingWithUsername, IBookingRepository, PaginatedResult, rideHistory } from "../../domain/repositories/IBookingrepository"; 
import { Booking, paymentStatus } from "../../domain/models/Booking"; 
import BookingModel from "./modals/Bookingschema"; 
import { injectable } from "tsyringe";
import { AuthError } from "../../domain/errors/Autherror";
import { STATUS_CODES } from "http";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import mongoose from "mongoose";
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
async countBookingsByStatus(driverId: string, year?: number, month?: number): Promise<Record<string, number>> {
    try {
      const matchStage: any = {
      driverId: new mongoose.Types.ObjectId(driverId)
    };

    if (year) {
      matchStage.$expr = {
        $eq: [{ $year: "$startDate" }, year]
      };
    }

    if (year && month) {
      matchStage.$expr = {
        $and: [
          { $eq: [{ $year: "$startDate" }, year] },
          { $eq: [{ $month: "$startDate" }, month] }
        ]
      };
    }

    const result = await BookingModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const summary: Record<string, number> = {};
    result.forEach((r) => {
      summary[r._id] = r.count;
    });

    return summary;
  
    } catch (error: any) {
      console.error('Error in countBookingsByStatus:', error.message);
      throw new AuthError('Failed to fetch booking status summary', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR); 
    }
  }

  async  getDriverEarningsByMonth(driverId: string, year: number, month?: number): Promise<{
    chartData: { label: string; totalEarnings: number }[];
    totalEarnings: number;
    totalRides: number;
  }> {
    try {
      const matchStage: any = {
      driverId: new mongoose.Types.ObjectId(driverId),
      paymentStatus: 'COMPLETED'
    };

    if (month) {
      matchStage.$expr = {
        $and: [
          { $eq: [{ $year: "$startDate" }, year] },
          { $eq: [{ $month: "$startDate" }, month] }
        ]
      };
    } else {
      matchStage.$expr = {
        $eq: [{ $year: "$startDate" }, year]
      };
    }

    const groupStage = month
      ? {
          _id: { $dayOfMonth: "$startDate" },
          total: { $sum: "$driver_fee" },
          count: { $sum: 1 }
        }
      : {
          _id: { $month: "$startDate" },
          total: { $sum: "$driver_fee" },
          count: { $sum: 1 }
        };

    const result = await BookingModel.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { _id: 1 } }
    ]);

    const chartData = result.map((r) => ({
      label: r._id.toString(),
      totalEarnings: r.total
    }));

    const totalEarnings = result.reduce((sum, r) => sum + r.total, 0);
    const totalRides = result.reduce((sum, r) => sum + r.count, 0);

    return { chartData, totalEarnings, totalRides };
    } catch (error: any) {
      console.error('Error in getDriverEarningsByMonth:', error.message);
      throw new AuthError('Failed to fetch earnings summary', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  }