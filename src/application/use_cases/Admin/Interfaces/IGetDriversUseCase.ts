import { Driver } from "../../../../domain/models/Driver";

export interface IGetDriversUseCase {
  execute(): Promise<Driver[]|null> 
}
