// src/application/use_cases/interfaces/IResendOTP.ts
import { ResendOtpResponseDto } from "../Data_transerObj/ResendOtpResponseDto"; 

export interface IResendOTP {
  execute(email: string, role: string): Promise<ResendOtpResponseDto>;
}
