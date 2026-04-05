import { inject, injectable } from "tsyringe";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { GoogleDistanceService } from "../../services/GoogleDistanceService";
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { DriverWithDistance, IGetNearbyDriverDetailsUseCase } from "../Interfaces/IGetNearbyDriverDetailsUseCase"; 

@injectable()
export class GetNearbyDriverDetails
  implements IGetNearbyDriverDetailsUseCase
{
  constructor(
    @inject(TOKENS.IDRIVER_REPO)
    private driverRepository: IDriverRepository,
    @inject(TOKENS.IUSER_REPO)
    private userRepository: IUserRepository,
    @inject(TOKENS.GOOGLE_DISTANCE_SERVICE)
    private distanceService: GoogleDistanceService
  ) {}

  async execute(userId: string, driverId: string, lat?: number, lng?: number): Promise<DriverWithDistance> {
    let latitude = lat;
    let longitude = lng;

    // 1️⃣ Fetch the user's location from the database if not provided
    if (latitude === undefined || longitude === undefined) {
      const user = await this.userRepository.getUserById(userId);
      if (!user?.location) {
        throw new AuthError("User location not found. Please provide coordinates or update your profile.", HTTP_STATUS_CODES.BAD_REQUEST);
      }
      latitude = user.location.latitude;
      longitude = user.location.longitude;
    }
const paginatedResult= await this.driverRepository.findActiveDrivers(
      1,
      3,
      ''
    );
    const drivers = paginatedResult.data;

    


    
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
    const driver = driversWithDistance.find(
  (d) => d._id?.toString() === driverId
);
   
    return {
      _id:driverId,
      name: driver?.name!,
      profileImage:driver?.profileImage!,
      location: driver?.location,
      place:driver?.place,
      averageRating:driver?.averageRating,
      distance: driver?.distance!
    };
  }
}
