import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { AuthError } from "../../../domain/errors/Autherror"; 
import { User } from "../../../domain/models/User";
import { TOKENS } from "../../../constants/Tokens";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IUpdateUserData } from "./interfaces/IUpdateUserData";

@injectable()
export class UpdateUserData implements IUpdateUserData  {
  constructor(
    @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository
  ) {}

  async execute(userId: string, updateData: Partial<User>):Promise<Partial<User|null>>{
    if (!userId) {
      throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND, HTTP_STATUS_CODES.BAD_REQUEST);
    }
console.log(updateData);

    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }

    const updatedUser = await this.userRepository.updateUser(userId, updateData);
    return updatedUser;
  }
}
