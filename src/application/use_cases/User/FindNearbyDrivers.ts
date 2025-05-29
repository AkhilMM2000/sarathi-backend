import { inject, injectable } from "tsyringe";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository"; 
import { IUserRepository } from "../../../domain/repositories/IUserepository"; 
import { GoogleDistanceService } from "../../services/GoogleDistanceService"; 
import { AuthError } from "../../../domain/errors/Autherror";

@injectable()
export class FindNearbyDrivers {
  constructor(
    @inject("IDriverRepository") private driverRepository: IDriverRepository,
    @inject("IUserRepository") private userRepository: IUserRepository,
    @inject("GoogleDistanceService") private distanceService: GoogleDistanceService
  ) {}

  async execute(userId: string) {
    // 1️⃣ Fetch the user's location from the database
    const user = await this.userRepository.getUserById(userId)
    
    if (!user) {
        throw new AuthError("User not found", 404);
      }
      
      if (!user.location) {
        throw new AuthError("User location not found", 400);
      }

    const { latitude, longitude } = user.location;

    // 2️⃣ Fetch all active drivers from the database
    const drivers = await this.driverRepository.findAllActiveDrivers();
   
    if (drivers.length === 0) return [];

    // 3️⃣ Extract driver locations for API call
    const driverLocations = drivers.map((driver) => ({
      id: driver._id?.toString() || "", 
      latitude: driver.location.latitude,
      longitude: driver.location.longitude,
    }));

    // 4️⃣ Get real-world distances using Google Maps API
    const distances = await this.distanceService.getDistances(
      { latitude, longitude },
      driverLocations
    );

    // 5️⃣ Attach distances to drivers
    const driversWithDistance = drivers.map((driver) =>{
        const driverId = driver._id?.toString(); // Convert ObjectId to string
      
        return {
          ...driver,
          distance: driverId ? distances[driverId] || null : null, 
        };
      });
      

    // 6️⃣ Sort drivers by distance (ascending)
    return driversWithDistance.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }
}
