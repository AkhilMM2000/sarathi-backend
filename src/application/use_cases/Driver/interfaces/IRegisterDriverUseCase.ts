import { Driver } from "../../../../domain/models/Driver";
import { RegisterDriverRequest } from "../../../../presentation/dto/driver/DriverRequestDTO";

export interface IRegisterDriverUseCase {
  execute(driverData: RegisterDriverRequest): Promise<{ message: string }>;
}
