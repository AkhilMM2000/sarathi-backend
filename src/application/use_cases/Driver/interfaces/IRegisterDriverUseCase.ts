import { Driver } from "../../../../domain/models/Driver";

export interface IRegisterDriverUseCase {
  execute(driverData: Driver): Promise<{ message: string }>;
}
