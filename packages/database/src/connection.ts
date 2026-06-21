import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

function resolvePostgresHost(): string {
    return process.env.POSTGRES_HOST?.trim() || "localhost"
}

export const queryClient = postgres({
    host: resolvePostgresHost(),
    port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
    database: process.env.POSTGRES_DB || "meshmind",
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD,
})

export const db = drizzle(queryClient, { schema })

export async function healthCheck(): Promise<{ ok: boolean; error?: string }> {
    try {
        await queryClient`SELECT 1`
        return { ok: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return { ok: false, error: message }
    }
}

export async function closeConnection(): Promise<void> {
    await queryClient.end()
}

export default db
