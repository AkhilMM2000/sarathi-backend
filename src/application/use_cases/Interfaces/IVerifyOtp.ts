import { VerifyOtpResponseDto } from "../Data_transerObj/VerifyOtpResponseDto";

export interface IVerifyOtp {
  execute(email: string, otp: string, role: "user" | "driver"): Promise<VerifyOtpResponseDto>;
}
