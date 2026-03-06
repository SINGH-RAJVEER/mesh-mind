import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@mindscribe/database";
import { google, github } from "better-auth/social-providers";

const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: process.env.SECRET_KEY || "supersecret",
  basePath: "/auth",
  baseURL: process.env.BACKEND_URL || "http://localhost:8000",
  redirects: {
    signIn: `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/callback`,
    signUp: `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/callback`,
    resetPassword: `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password`,
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [
    google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    github({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173"],
});

export default auth;
