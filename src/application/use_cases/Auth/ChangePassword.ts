import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/repositories/IUserepository"; 
import { IDriverRepository } from "../../../domain/repositories/IDriverepository"; 
import { HashService } from "../../services/HashService"; 
import { AuthError } from "../../../domain/errors/Autherror";


@injectable()
export class ChangePassword {
  constructor(
    @inject("IUserRepository") private userRepository: IUserRepository,
    @inject("IDriverRepository") private driverRepository: IDriverRepository,
    @inject("HashService") private hashService: HashService
  ) {}

  async execute(userId: string, oldPassword: string, newPassword: string, role: "user" | "driver"): Promise<void> {
    let account;

    // Fetch account based on role
    if (role === "user") {
      account = await this.userRepository.getUserById(userId);
    } else {
      account = await this.driverRepository.findDriverById(userId);
    }

    if (!account) {
        throw new AuthError("Account not found.", 404); // 404 Not Found
      }
 
    const isPasswordValid = await this.hashService.compare(oldPassword, account.password);
  
if (!isPasswordValid) {
    throw new AuthError("Incorrect current password.", 400); // 400 Bad Request
  }
   
  
    if (role === "user") {
      await this.userRepository.updateUser(userId, { password: newPassword });
    } else {
      await this.driverRepository.update(userId, { password: newPassword });
    }
  }
}
