import { injectable } from "tsyringe";
import { IDriverRepository } from "../../domain/repositories/IDriverepository";
import { Driver } from "../../domain/models/Driver";
import DriverModel from "./modals/Driverschema"; // MongoDB Schema
import { isValidObjectId, Types } from "mongoose";
import { AuthError } from "../../domain/errors/Autherror";
import { PaginatedResult } from "../../domain/repositories/IBookingrepository";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";

@injectable()
export class MongoDriverRepository implements IDriverRepository {
 async create(driver: Driver): Promise<Driver> {
  let geoDriver = { ...driver };

  if ("latitude" in driver.location && "longitude" in driver.location) {
    geoDriver.location = {
      type: "Point",
      coordinates: [driver.location.longitude, driver.location.latitude],
    };
  }

  const newDriver = new DriverModel(geoDriver);
  const savedDriver = await newDriver.save();
  return savedDriver.toObject() as Driver;
}async update(driverId: string, data: Partial<Driver>): Promise<Driver | null> {
  if (!isValidObjectId(driverId)) {
    throw new AuthError("Invalid driver ID", HTTP_STATUS_CODES.BAD_REQUEST);
  }

  const driver = await DriverModel.findById(driverId);
  if (!driver) return null;

  if (
    data.location &&
    "latitude" in data.location &&
    "longitude" in data.location
  ) {
    data.location = {
      type: "Point",
      coordinates: [data.location.longitude, data.location.latitude],
    } as any;
  }

  Object.assign(driver, data);
  await driver.save();

  return driver.toObject() as Driver;
}
    
  async findDriverById(driverId: string): Promise<Driver | null> {
    try {
      return await DriverModel.findById(driverId)
      .select("-createdAt -updatedAt -__v") // Exclude fields
    
    } catch (error) {
      console.error("Error finding driver by ID:", error);
      return null;
    }
  }
  async findByEmail(email: string): Promise<Driver | null> {
    return await DriverModel.findOne({ email });
  }

  async updateStatus(
    driverId: string,
    status: "pending" | "approved" | "rejected",
    reason?: string
  ): Promise<Driver | null> {
    const updateData: any = { status };
    if (status === "rejected" && reason) {
   
      
      updateData.reason = reason;
    } else {
      updateData.reason = null;
    }
    
    return await DriverModel.findByIdAndUpdate(driverId, updateData, {
      new: true, 
      runValidators: true, 
    });
  }

  async blockOrUnblockDriver(driverId: string, isBlock: boolean): Promise<void> {
    await DriverModel.findByIdAndUpdate(driverId, { isBlock });
  }
 
  async getDrivers(): Promise<Driver[]> {
    return await DriverModel.find(); 
  }
  async findActiveDrivers(
  page: number,
  limit: number,
  placeKey?: string
): Promise<PaginatedResult<Driver>> {
  const skip = (page - 1) * limit;

  const matchStage: any = {
    status: "approved"
  };

  const trimmedPlaceKey = placeKey?.trim();
  if (trimmedPlaceKey) {
    matchStage.place = { $regex: trimmedPlaceKey, $options: "i" };
  }

  const aggregationPipeline = [
    { $match: matchStage },
    {
      $facet: {
        data: [
          { $project: {
              _id: 1,             
              name: 1,
              profileImage: 1,
              place: 1,
              location:1,
              averageRating:1
          }},
          { $skip: skip },
          { $limit: limit }
        ],
        totalCount: [
          { $count: "count" }
        ]
      }
    }
  ];

  const result = await DriverModel.aggregate(aggregationPipeline);

  const data = result[0]?.data || [];
  const total = result[0]?.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data: data as Driver[],
    total,
    page,
    totalPages
  };
}


async updateStripeAccount(driverId: string, stripeAccountId: string): Promise<Driver> {
  try {
    const driver = await DriverModel.findById(driverId);

    if (!driver) {
      throw new AuthError('Driver not found', 404);
    }

    driver.stripeAccountId = stripeAccountId;
    await driver.save();

    return { ...driver.toObject(), _id: driver._id } as Driver;
  } catch (error: any) {
    console.error('Failed to update Stripe account for driver:', error);
    throw new AuthError('Failed to update Stripe account', 500);
  }
}


async updateRatingStats(driverId: string, stats: {
  totalRatingPoints: number;
  totalRatings: number;
  averageRating: number;
}): Promise<void> {
  await DriverModel.findByIdAndUpdate(driverId, {
    $set: {
      totalRatingPoints: stats.totalRatingPoints,
      totalRatings: stats.totalRatings,
      averageRating: stats.averageRating,
    },
  });
}

async findNearbyDriversWithinRadius(
  location: { latitude: number; longitude: number },
  excludedDriverIds: string[],
  radiusInKm: number
): Promise<{ _id: string; latitude: number; longitude: number }[]> {
  try {
    const radiusInMeters = radiusInKm * 1000;

    const excludedObjectIds = excludedDriverIds
      .filter(isValidObjectId)
      .map((id) => new Types.ObjectId(id));

    const result = await DriverModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude],
          },
          distanceField: 'distance',
          maxDistance: radiusInMeters,
          spherical: true,
          query: {
            _id: { $nin: excludedObjectIds },
            onlineStatus: 'online',
            isBlock: false,
            status: 'approved',
          },
        },
      },
      {
        $project: {
          _id: 1,
          latitude: { $arrayElemAt: ['$location.coordinates', 1] },
          longitude: { $arrayElemAt: ['$location.coordinates', 0] },
        },
      },
    ]);

    return result;
  } catch (error) {
    console.error('❌ Error in findNearbyDriversWithinRadius:', error);
    throw new AuthError('Failed to find nearby drivers', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
}

}

