import { type Context, Hono } from "hono"
import auth from "../auth"

const authRouter = new Hono()

authRouter.get("/oauth/url/:provider", async (c: Context) => {
    const provider = c.req.param("provider") as string | undefined

    if (!provider || !["google", "github"].includes(provider)) {
        return c.json({ error: "Invalid provider" }, 400)
    }

    try {
        // BetterAuth OAuth authorization endpoint
        const redirectTo = c.req.query("redirect_to") || "/"
        const authURL = `${process.env["BACKEND_URL"] || "http://localhost:8000"}/auth/oauth/authorize/${provider}?redirect_to=${encodeURIComponent(redirectTo)}`
        return c.json({ authURL, provider })
    } catch (_err) {
        return c.json({ error: "Failed to get OAuth URL" }, 500)
    }
})

// Get current user profile
authRouter.get("/me", async (c: Context) => {
    try {
        const session = await auth.api.getSession({ headers: c.req.raw.headers })

        if (!session) {
            return c.json({ detail: "Unauthorized" }, 401)
        }

        return c.json({
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
            emailVerified: session.user.emailVerified,
        })
    } catch (_err) {
        return c.json({ detail: "Failed to get user session" }, 500)
    }
})

authRouter.all("/*", async (c: Context) => {
    return auth.handler(c.req.raw)
})

export { authRouter }
