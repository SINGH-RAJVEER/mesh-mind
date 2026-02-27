import express, { type Router } from "express";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY, ALGORITHM } from "../config";
import { User } from "@mindscribe/database";
import mongoose from "mongoose";

const router: Router = express.Router();

interface JwtPayload {
  user_id: string;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: {
    id: mongoose.Types.ObjectId;
  };
}

// Create JWT token
const createJwtToken = (payload: {
  user_id: mongoose.Types.ObjectId;
}): string => {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
  return jwt.sign({ user_id: payload.user_id.toString(), exp }, SECRET_KEY, {
    algorithm: ALGORITHM as jwt.Algorithm,
  });
};

// Middleware to verify token
export const getCurrentUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = (req as Request).headers.authorization;
  if (!authHeader) {
    res.status(401).json({ detail: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY, {
      algorithms: [ALGORITHM as jwt.Algorithm],
    }) as JwtPayload;
    req.user = { id: new mongoose.Types.ObjectId(decoded.user_id) };
    next();
  } catch (err) {
    res.status(401).json({ detail: "Invalid or expired token" });
    return;
  }
};

// POST /auth/register
router.post(
  "/register",
  async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ detail: "Email already registered" });

      const hash = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hash });
      await user.save();
      return res.json({ message: "User registered successfully" });
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ detail: "Username or email already exists" });
      }
      return res
        .status(500)
        .json({ detail: error.message || "An error occurred" });
    }
  },
);

// POST /auth/login
router.post(
  "/login",
  async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(401).json({ detail: "Invalid email or password" });

      const result = await bcrypt.compare(password, user.password);
      if (!result)
        return res.status(401).json({ detail: "Invalid email or password" });

      const token = createJwtToken({ user_id: user._id });
      return res.json({
        access_token: token,
        token_type: "bearer",
        user: { id: user._id, username: user.username, email: user.email },
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      return res
        .status(500)
        .json({ detail: error.message || "An error occurred" });
    }
  },
);

export { router as authRouter };
