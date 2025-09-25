import { Driver } from "../../../../domain/models/Driver";

export interface IGetDriverProfile {
  execute(driverId: string): Promise<Driver | null>;
}
