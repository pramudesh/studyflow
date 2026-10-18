import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: { message: err.message, details: err.details },
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Unexpected error";
  if (env.nodeEnv !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(500).json({
    error: { message: env.nodeEnv === "production" ? "Internal server error" : message },
  });
}
