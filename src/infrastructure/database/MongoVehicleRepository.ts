import { VehicleModel } from "./modals/VehicleSchema";
import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository"; 
import { Vehicle } from "../../domain/models/Vehicle"; 
import { injectable } from "tsyringe";
import { Types } from "mongoose";

@injectable()
export class MongoVehicleRepository implements IVehicleRepository {
    async addVehicle(vehicleData: Vehicle): Promise<Vehicle> {
        try {
            const vehicle = new VehicleModel(vehicleData);
            console.log("Before saving:", vehicle);
    
            const savedVehicle = await vehicle.save();
    
            console.log("After saving:", savedVehicle);
            return savedVehicle.toObject() as Vehicle;
        } catch (error) {
            console.error("Error saving vehicle:", error);
            throw error;
        }
      }
    
      // Edit vehicle details (partial update)
      async editVehicle(vehicleId: string, updateData: Partial<Vehicle>): Promise<Vehicle | null> {
        if (!Types.ObjectId.isValid(vehicleId)) return null;
        const updatedVehicle = await VehicleModel.findByIdAndUpdate(vehicleId, updateData, {
          new: true,
          runValidators: true,
        });
        return updatedVehicle ? updatedVehicle.toObject() as Vehicle : null;
      }
    
      // Get a vehicle by its ID
      async getVehicleById(vehicleId: string): Promise<Vehicle | null> {
        if (!Types.ObjectId.isValid(vehicleId)) return null;
        const vehicle = await VehicleModel.findById(vehicleId);
        return vehicle ? vehicle.toObject() as Vehicle : null;
      }
    
      // Get all vehicles registered by a specific user
      async getVehiclesByUser(userId: string): Promise<Vehicle[]> {
        if (!Types.ObjectId.isValid(userId)) return [];
        const vehicles = await VehicleModel.find({ userId });
        return vehicles.map(vehicle => vehicle.toObject() as Vehicle);
      }
    
      // Delete a vehicle by ID
      async deleteVehicle(vehicleId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(vehicleId)) return false;
        const result = await VehicleModel.findByIdAndDelete(vehicleId);
        return !!result;
      }
      async findAll(): Promise<Vehicle[]> {
        return await VehicleModel.find()
      }
}
