import { UserWithVehicleCount } from "../../../../domain/repositories/IUserepository";

export interface IBlockUserUseCase {
  execute(userId: string, status: boolean): Promise<UserWithVehicleCount | null>
}
