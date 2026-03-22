import { db } from "@meshmind/database"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { betterAuth } from "better-auth/minimal"
import { github, google } from "better-auth/social-providers"
import { ALLOWED_FRONTEND_ORIGINS, BACKEND_URL, FRONTEND_URL } from "./config"

const authSecret = process.env.BETTER_AUTH_SECRET || "local-dev-super-secret"

const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "pg", usePlural: true }),
    advanced: {
        database: {
            generateId: "uuid",
        },
    },
    secret: authSecret,
    basePath: "/auth",
    baseURL: BACKEND_URL,

    redirects: {
        signIn: `${FRONTEND_URL}/auth/callback`,
        signUp: `${FRONTEND_URL}/auth/callback`,
        resetPassword: `${FRONTEND_URL}/reset-password`,
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

    trustedOrigins: ALLOWED_FRONTEND_ORIGINS,
})

export default auth
