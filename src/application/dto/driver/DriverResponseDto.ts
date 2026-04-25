import { Driver } from "../../../domain/models/Driver";

/**
 * Driver Response DTO
 * Safe subset of driver data for public API
 */
export interface DriverResponseDto {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  profileImage: string;
  location: 
    | { latitude: number; longitude: number } 
    | { type: "Point"; coordinates: [number, number] };
  place: string;
  status: string;
  onlineStatus: 'online' | 'offline';
  averageRating: number;
  totalRatings: number;
  distance?: number | null;
}

export interface DriverFullResponseDto extends DriverResponseDto {
  aadhaarNumber: string;
  licenseNumber: string;
  aadhaarImage: string;
  licenseImage: string;
  stripeAccountId?: string;
  activePayment?: boolean;
}

/**
 * Mapper: Domain Entity -> DriverResponseDto
 */
export const toDriverResponse = (driver: Partial<Driver> & { distance?: number | null }): DriverResponseDto => {
  return {
    _id: driver._id?.toString() || "",
    name: driver.name || "",
    email: driver.email || "",
    mobile: driver.mobile || "",
    profileImage: driver.profileImage || "",
    location: driver.location || { latitude: 0, longitude: 0 },
    place: driver.place || "",
    status: driver.status || "pending",
    onlineStatus: driver.onlineStatus || "offline",
    averageRating: driver.averageRating || 0,
    totalRatings: driver.totalRatings || 0,
    distance: driver.distance ?? null,
  };
};

/**
 * Mapper: Domain Entity -> DriverFullResponseDto
 */
export const toDriverFullResponse = (driver: Partial<Driver>): DriverFullResponseDto => {
  return {
    ...toDriverResponse(driver),
    aadhaarNumber: driver.aadhaarNumber || "",
    licenseNumber: driver.licenseNumber || "",
    aadhaarImage: driver.aadhaarImage || "",
    licenseImage: driver.licenseImage || "",
    stripeAccountId: driver.stripeAccountId || "",
    activePayment: driver.activePayment || false,
  };
};

/**
 * Mapper: Array of Domain Entities -> Array of DriverResponseDto
 */
export const toDriverListResponse = (drivers: (Partial<Driver> & { distance?: number | null })[]): DriverResponseDto[] => {
  return drivers.map(toDriverResponse);
};
