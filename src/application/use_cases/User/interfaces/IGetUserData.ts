export interface IGetUserData {
  execute(userId: string): Promise<any>; 
}
