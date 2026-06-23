import { serve } from "@hono/node-server"
import { healthCheck } from "@meshmind/database"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { ALLOWED_FRONTEND_ORIGINS, isAllowedFrontendOrigin } from "./config"
import { authRouter } from "./routes/auth"
import { chatbotRouter } from "./routes/chat"

const app = new Hono()
const PORT = parseInt(process.env["PORT"] || "8000", 10)

app.use(
    "*",
    cors({
        origin: (origin) => {
            if (origin && isAllowedFrontendOrigin(origin)) return origin
            return undefined
        },
        credentials: true,
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
)
app.use("*", logger())

app.route("/auth", authRouter)
app.route("/chat", chatbotRouter)

app.get("/", (c) => {
    return c.json({ message: "MeshMind Chat API" })
})

app.get("/health", async (c) => {
    const pgStatus = await healthCheck()

    return c.json({
        status: pgStatus.ok ? "healthy" : "degraded",
        services: {
            postgresql: pgStatus.ok ? "connected" : "disconnected",
        },
        ...(pgStatus.error ? { databaseError: pgStatus.error } : {}),
        timestamp: new Date().toISOString(),
    })
})

const effectiveLlmModel = process.env["LLM_MODEL"] || "gpt-3.5-turbo"
const effectiveEmbeddingModel = process.env["LLM_EMBEDDING_MODEL"] || "text-embedding-004"

serve(
    {
        fetch: app.fetch,
        port: PORT,
    },
    async (info) => {
        console.log(`API running on port ${info.port}`)
        console.log(`Allowed frontend origins: ${ALLOWED_FRONTEND_ORIGINS.join(", ")}`)
        console.log(`LLM Model: ${effectiveLlmModel}`)
        console.log(`Embedding Model: ${effectiveEmbeddingModel}`)

        const pgStatus = await healthCheck()

        if (pgStatus.ok) {
            console.log("PostgreSQL with pgvector is ready")
        } else {
            console.warn(
                `${pgStatus.error ? `${pgStatus.error}` : "pgvector unavailable"} - embeddings will be disabled`
            )
        }
    }
)
