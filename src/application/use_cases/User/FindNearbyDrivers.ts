import { inject, injectable } from "tsyringe";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository"; 
import { IUserRepository } from "../../../domain/repositories/IUserepository"; 
import { GoogleDistanceService } from "../../services/GoogleDistanceService"; 
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";

@injectable()
export class FindNearbyDrivers {
  constructor(
    @inject(TOKENS.IDRIVER_REPO) private driverRepository: IDriverRepository,
    @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository,
    @inject("GoogleDistanceService") private distanceService: GoogleDistanceService
  ) {}

   async execute(userId: string, page: number = 1, limit: number = 2, placeKey?: string) {
    // 1️⃣ Fetch the user's location from the database
    const user = await this.userRepository.getUserById(userId);
    
    if (!user) {
      throw new AuthError("User not found", 404);
    }

    if (!user.location) {
      throw new AuthError("User location not found", 400);
    }
 const { latitude, longitude } = user.location;
    // 2️⃣ Use paginated driver fetching from repository
    const paginatedResult= await this.driverRepository.findActiveDrivers(
      page,
      limit,
      placeKey
    );
    const drivers = paginatedResult.data;

    if (drivers.length === 0) return { ...paginatedResult, data: [] };

    // 3️⃣ Extract driver locations
    const driverLocations = drivers.map((driver) => {
      if ('coordinates' in driver.location) {
        return {
          id: driver._id?.toString() || "",
          latitude: driver.location.coordinates[1],
          longitude: driver.location.coordinates[0],
        };
      } else {
        return {
          id: driver._id?.toString() || "",
          latitude: driver.location.latitude,
          longitude: driver.location.longitude,
        };
      }
    });

    // 4️⃣ Get distances
    const distances = await this.distanceService.getDistances(
      { latitude, longitude },
      driverLocations
      
    );

    // 5️⃣ Add distance to driver
    const driversWithDistance = drivers.map((driver) => {
      const driverId = driver._id?.toString();
      return {
        ...driver,
        distance: driverId ? distances[driverId] || null : null,
      };
    });

    // 6️⃣ Sort & return with pagination info
    return {
      ...paginatedResult,
      data: driversWithDistance.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)),
    };
  }
  
}
