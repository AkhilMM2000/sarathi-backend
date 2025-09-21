
export interface LoginRequestDto {
  email: string;
  password: string;
  role: "user" | "driver" | "admin";
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  role: "user" | "driver" | "admin";
}
