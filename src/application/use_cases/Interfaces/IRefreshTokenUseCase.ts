export interface IRefreshTokenUseCase {
  execute(refreshToken: string, role: "user" | "driver" | "admin"): Promise<string>;
}
