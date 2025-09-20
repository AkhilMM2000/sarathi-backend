export interface VerifyOtpResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    role: "user" | "driver";
  };
}
