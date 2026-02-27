import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";

export interface AuthRequest extends Request {
  user?: {
    user_id: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { user_id: string };
    req.user = { user_id: decoded.user_id };
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
