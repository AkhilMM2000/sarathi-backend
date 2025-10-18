import { Driver } from "../../../../domain/models/Driver";

export interface IEditDriverProfile {
  execute(driverId: string, updateData: Partial<Driver>): Promise<Driver | null>;
}
