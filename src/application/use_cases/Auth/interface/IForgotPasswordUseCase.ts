export interface IForgotPasswordUseCase {
  execute(email: string, role: "user" | "driver"): Promise<void>;
}
