export const SECRET_KEY = process.env.SECRET_KEY || "supersecret";
export const ALGORITHM = "HS256";
export const ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
