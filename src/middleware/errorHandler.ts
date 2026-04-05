import { ErrorRequestHandler } from "express";
import { AuthError } from "../domain/errors/Autherror";
import { ERROR_MESSAGES } from "../constants/ErrorMessages";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AuthError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle jsonwebtoken library errors
  if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: err.name === "TokenExpiredError" ? "Session expired. Please login again." : "Invalid session token.",
    });
    return;
  }

  console.error("Unexpected error:", err);

  res.status(500).json({
    success: false,
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  });
};
