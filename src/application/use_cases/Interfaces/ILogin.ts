

import {  LoginResponseDto  } from "../Data_transerObj/LoginDto";
export interface ILogin {
  execute( email: string,
    password: string,
    role: "user" | "driver" | "admin"): Promise<LoginResponseDto>;
}
