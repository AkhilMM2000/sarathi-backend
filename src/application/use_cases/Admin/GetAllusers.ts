

import { User } from "../../../domain/models/User"; 
import { inject, injectable } from "tsyringe";
import { IUserRepository ,UserWithVehicleCount} from "../../../domain/repositories/IUserepository";
import { TOKENS } from "../../../constants/Tokens";

@injectable()
export class GetAllUsers {
  constructor(
    @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository,


  ) {}

  async execute(): Promise<UserWithVehicleCount[]|null> {
    return await this.userRepository.getUsers()
  }
}