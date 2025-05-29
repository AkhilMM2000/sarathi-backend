export class AuthError extends Error {
    public statusCode: number;
  
    constructor(message = "Authentication failed", statusCode = 401) {
      super(message);
      this.statusCode = statusCode;
  
      // Ensure the name property is properly set (useful for debugging)
      this.name = "AuthError";
  
      // Maintain proper stack trace
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, AuthError);
      }
    }
  }
  