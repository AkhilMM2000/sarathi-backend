


import { inject, injectable } from "tsyringe";
import { IUserRepository ,UserWithVehicleCount} from "../../../domain/repositories/IUserepository";
import { TOKENS } from "../../../constants/Tokens";
import { IGetAllUsersUseCase } from "./Interfaces/IGetAllUsersUseCase";

@injectable()
export class GetAllUsers implements IGetAllUsersUseCase  {
  constructor(
    @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository,
  ) {}

  async execute(): Promise<UserWithVehicleCount[]|null> {
    return await this.userRepository.getUsers()
  }
}