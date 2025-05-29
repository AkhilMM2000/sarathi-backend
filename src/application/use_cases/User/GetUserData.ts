import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/repositories/IUserepository"; 
import { AuthError } from "../../../domain/errors/Autherror"; 

@injectable() 
export class GetUserData {
  constructor(
    @inject("IUserRepository") private userRepository: IUserRepository
  ) {}

  async execute(userId: string) {
    if (!userId) {
      throw new AuthError("User ID is required", 400);
    }
console.log(userId);
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new AuthError("User not founde", 404);
    }

    return user;
  }
}
