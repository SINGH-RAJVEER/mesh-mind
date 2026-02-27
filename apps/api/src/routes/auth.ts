import express, { type Router } from "express";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import {
  SECRET_KEY,
  ALGORITHM,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  FRONTEND_URL,
  BACKEND_URL,
} from "../config";
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

// Validate password strength
const validatePassword = (
  password: string,
): { valid: boolean; error?: string } => {
  if (password.length < 8) {
    return {
      valid: false,
      error: "Password must be at least 8 characters long",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" };
  }
  return { valid: true };
};

// POST /auth/register - Register with email and password
router.post(
  "/register",
  async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password } = req.body;

    try {
      // Validate input
      if (!username || !email || !password) {
        return res
          .status(400)
          .json({ detail: "Username, email, and password are required" });
      }

      const passwordVal = validatePassword(password);
      if (!passwordVal.valid) {
        return res.status(400).json({ detail: passwordVal.error });
      }

      // Check if user exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        return res.status(400).json({
          detail:
            existingUser.email === email
              ? "Email already registered"
              : "Username already taken",
        });
      }

      // Hash password and create user
      const hash = await bcrypt.hash(password, 10);
      const user = new User({
        username,
        email,
        password: hash,
        provider: "local",
      });
      await user.save();

      return res.status(201).json({ message: "User registered successfully" });
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

// POST /auth/login - Login with email and password
router.post(
  "/login",
  async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return res
          .status(400)
          .json({ detail: "Email and password are required" });
      }

      const user = await User.findOne({ email });
      if (!user || user.provider !== "local" || !user.password) {
        return res.status(401).json({ detail: "Invalid email or password" });
      }

      const result = await bcrypt.compare(password, user.password);
      if (!result) {
        return res.status(401).json({ detail: "Invalid email or password" });
      }

      const token = createJwtToken({ user_id: user._id });
      return res.json({
        access_token: token,
        token_type: "bearer",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          provider: user.provider,
        },
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      return res
        .status(500)
        .json({ detail: error.message || "An error occurred" });
    }
  },
);

// POST /auth/google/callback - Google OAuth callback
router.post(
  "/google/callback",
  async (req: Request, res: Response): Promise<Response> => {
    const { token: googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ detail: "Google token is required" });
    }

    try {
      // Verify token with Google
      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        {
          headers: { Authorization: `Bearer ${googleToken}` },
        },
      );

      const { email, name, picture } = response.data;

      if (!email) {
        return res
          .status(400)
          .json({ detail: "Unable to retrieve email from Google" });
      }

      // Find or create user
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          username: name || email.split("@")[0],
          profile_picture: picture,
          provider: "google",
          provider_id: response.data.id,
        });
        await user.save();
      } else if (user.provider !== "google") {
        // Link Google account to existing email user
        user.provider = "google";
        user.provider_id = response.data.id;
        user.profile_picture = user.profile_picture || picture;
        await user.save();
      }

      const token = createJwtToken({ user_id: user._id });
      return res.json({
        access_token: token,
        token_type: "bearer",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          provider: user.provider,
          profile_picture: user.profile_picture,
        },
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("Google auth error:", error);
      return res
        .status(401)
        .json({ detail: "Failed to authenticate with Google" });
    }
  },
);

// POST /auth/github/callback - GitHub OAuth callback
router.post(
  "/github/callback",
  async (req: Request, res: Response): Promise<Response> => {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ detail: "Authorization code is required" });
    }

    try {
      // Exchange code for access token
      const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: { Accept: "application/json" },
        },
      );

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        return res
          .status(401)
          .json({ detail: "Failed to get GitHub access token" });
      }

      // Get user info from GitHub
      const userResponse = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const { login, id, avatar_url } = userResponse.data;
      const email = userResponse.data.email || `${login}@github.local`;

      // Find or create user
      let user = await User.findOne({
        $or: [{ email }, { provider_id: id.toString(), provider: "github" }],
      });

      if (!user) {
        user = new User({
          email,
          username: login,
          profile_picture: avatar_url,
          provider: "github",
          provider_id: id.toString(),
        });
        await user.save();
      } else if (user.provider !== "github") {
        user.provider = "github";
        user.provider_id = id.toString();
        user.profile_picture = user.profile_picture || avatar_url;
        await user.save();
      }

      const token = createJwtToken({ user_id: user._id });
      return res.json({
        access_token: token,
        token_type: "bearer",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          provider: user.provider,
          profile_picture: user.profile_picture,
        },
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("GitHub auth error:", error);
      return res
        .status(401)
        .json({ detail: "Failed to authenticate with GitHub" });
    }
  },
);

// GET /auth/profile - Get current user profile
router.get(
  "/profile",
  getCurrentUser,
  async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const user = await User.findById(req.user?.id);
      if (!user) {
        return res.status(404).json({ detail: "User not found" });
      }

      return res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        provider: user.provider,
        profile_picture: user.profile_picture,
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
