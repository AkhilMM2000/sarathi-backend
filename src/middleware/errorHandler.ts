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

  console.error("Unexpected error:", err);

  res.status(500).json({
    success: false,
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  });
};
