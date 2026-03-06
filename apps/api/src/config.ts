const DEFAULT_FRONTEND_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
] as const;

const normalizeOrigin = (value: string) => {
  try {
    return new URL(value).origin;
  } catch {
    return value.trim().replace(/\/+$/, "");
  }
};

const parseOrigins = (value?: string) => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(normalizeOrigin);
};

const configuredFrontendOrigins = parseOrigins(process.env.FRONTEND_URL);

// Authentication
export const AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET || "local-dev-super-secret";

// URLs
export const ALLOWED_FRONTEND_ORIGINS = Array.from(
  new Set([...configuredFrontendOrigins, ...DEFAULT_FRONTEND_ORIGINS]),
);
export const FRONTEND_URL =
  configuredFrontendOrigins[0] || DEFAULT_FRONTEND_ORIGINS[0];
export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export const isAllowedFrontendOrigin = (origin?: string | null) => {
  if (!origin) {
    return false;
  }

  return ALLOWED_FRONTEND_ORIGINS.includes(normalizeOrigin(origin));
};
