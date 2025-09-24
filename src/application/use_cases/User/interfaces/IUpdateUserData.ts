import { User } from "../../../../domain/models/User";

export interface IUpdateUserData {
 execute(userId: string, updateData: Partial<User>):Promise<Partial<User|null>> 
}
