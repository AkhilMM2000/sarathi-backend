import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/repositories/IUserepository"; 
import { AuthError } from "../../../domain/errors/Autherror"; 
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { IGetUserData } from "./interfaces/IGetUserData";

@injectable() 
export class GetUserData  implements IGetUserData{
  constructor(
    @inject(TOKENS.IUSER_REPO) private userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<any>{
    if (!userId) {
      throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND,HTTP_STATUS_CODES.BAD_REQUEST);
    }
console.log(userId);
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND,HTTP_STATUS_CODES.NOT_FOUND);
    }

    return user;
  }
}


