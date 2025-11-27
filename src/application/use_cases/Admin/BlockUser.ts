import { inject, injectable } from "tsyringe";
import { IUserRepository ,UserWithVehicleCount} from "../../../domain/repositories/IUserepository";
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IBlockUserUseCase } from "./Interfaces/IBlockUserUseCase";

@injectable()
export class BlockUserUseCase implements IBlockUserUseCase {
  constructor(
    @inject(TOKENS.IUSER_REPO)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(userId: string,status:boolean): Promise<UserWithVehicleCount | null> {
 
     
      
      const blockedUser = await this.userRepository.blockOrUnblockUser(userId,status);
     
      if (!blockedUser) {
       
        throw new AuthError("User not found or already blocked",HTTP_STATUS_CODES.NOT_FOUND)
      }

      return blockedUser;
    } 
}
