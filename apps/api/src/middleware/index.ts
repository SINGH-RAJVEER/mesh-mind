import type { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: {
    user_id: string;
  };
}

export interface ApiError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  error: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    error: message,
    statusCode,
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
