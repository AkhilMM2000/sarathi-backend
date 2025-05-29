import { injectable } from "tsyringe";
import { IDriverRepository } from "../../domain/repositories/IDriverepository";
import { Driver } from "../../domain/models/Driver";
import DriverModel from "./modals/Driverschema"; // MongoDB Schema
import { isValidObjectId } from "mongoose";
import { AuthError } from "../../domain/errors/Autherror";

@injectable()
export class MongoDriverRepository implements IDriverRepository {
  async create(driver: Driver): Promise<Driver> {
    const newDriver = new DriverModel(driver);
    const savedDriver = await newDriver.save();

    // Convert to a plain JavaScript object
    return savedDriver.toObject() as Driver;
  }
  async update(userId: string, data: Partial<Driver>): Promise<Driver | null> {
      if (!isValidObjectId(userId)) throw new Error("Invalid user ID");
    
      const user = await DriverModel.findById(userId);
      if (!user) return null;
    
      Object.assign(user, data);
    
      await user.save();
    
      return user.toObject() as Driver
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
async findAllActiveDrivers(): Promise<Driver[]> {
  return (await DriverModel.find({ status: "approved" }).lean()) as unknown as Driver[];
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

}
