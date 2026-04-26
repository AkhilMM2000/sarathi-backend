import { BaseError } from "./BaseError";

export class AuthError extends BaseError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
  }
}