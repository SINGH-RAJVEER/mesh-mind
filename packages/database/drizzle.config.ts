import { defineConfig } from "drizzle-kit"

declare const process: {
    env: Record<string, string | undefined>
}

function resolvePostgresHost(): string {
    return process.env.POSTGRES_HOST?.trim() || "localhost"
}

export default defineConfig({
    schema: "./src/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        host: resolvePostgresHost(),
        port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
        user: process.env.POSTGRES_USER || "postgres",
        password: process.env.POSTGRES_PASSWORD || "",
        database: process.env.POSTGRES_DB || "meshmind",
        ssl: false,
    },
})
