import type { Context } from "hono"
import auth from "../auth"

export interface AuthContext extends Context {
    set(key: string, value: unknown): void
    get(key: string): unknown
}

export const getCurrentUser = async (c: AuthContext, next: () => Promise<void>) => {
    try {
        const session = await auth.api.getSession({ headers: c.req.raw.headers })

        if (!session) return c.json({ detail: "Unauthorized" }, 401)

        c.set("user", { id: session.user.id })
        c.set("session", session)
        await next()
    } catch (_err) {
        return c.json({ detail: "Invalid or expired session" }, 401)
    }
}
