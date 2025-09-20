import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { AuthError } from "../../../domain/errors/Autherror"; 
import { User } from "../../../domain/models/User";
import { TOKENS } from "../../../constants/Tokens";


@injectable()
export class UpdateUserData {
  constructor(
    @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository
  ) {}

  async execute(userId: string, updateData: Partial<User>) {
    if (!userId) {
      throw new AuthError("User ID is required", 400);
    }
console.log(updateData);

    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new AuthError("User not found", 404);
    }

    const updatedUser = await this.userRepository.updateUser(userId, updateData);
    return updatedUser;
  }
}
