

import { User } from "../../../domain/models/User"; 
import { inject, injectable } from "tsyringe";
import { IUserRepository ,UserWithVehicleCount} from "../../../domain/repositories/IUserepository";

@injectable()
export class GetAllUsers {
  constructor(
    @inject("IUserRepository") private userRepository: IUserRepository,


  ) {}

  async execute(): Promise<UserWithVehicleCount[]|null> {
    return await this.userRepository.getUsers()
  }
}