import { User } from "../../../../domain/models/User";

export interface IGetUserData {
  execute(userId: string): Promise<User | null>; 
}
