import { inject, injectable } from "tsyringe";
import { IUserRepository ,UserWithVehicleCount} from "../../../domain/repositories/IUserepository";
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";

@injectable()
export class BlockUserUseCase {
  constructor(
    @inject(TOKENS.IUSER_REPO)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(userId: string,status:boolean): Promise<UserWithVehicleCount | null> {
    try {
     
      
      const blockedUser = await this.userRepository.blockOrUnblockUser(userId,status);
     
      if (!blockedUser) {
       
        throw new AuthError("User not found or already blocked",404)
      }

      return blockedUser;
    } catch (error) {
   
      throw new AuthError("Failed to block user",500);
    }
  }
  
}
