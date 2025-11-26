import { UserWithVehicleCount } from "../../../../domain/repositories/IUserepository";

export interface IGetAllUsersUseCase {
  execute(): Promise<UserWithVehicleCount[] | null>;
}
