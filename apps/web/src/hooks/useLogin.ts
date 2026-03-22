import { useNavigate } from "@solidjs/router"
import { createSignal } from "solid-js"
import { loginUser } from "../api/authApi"
import { toast } from "../components/Toast"
import { useAuthStore } from "../store/authStore"

export const useLogin = () => {
    const navigate = useNavigate()
    const { refreshSession } = useAuthStore()
    const [isPending, setIsPending] = createSignal(false)
    const [error, setError] = createSignal<string | null>(null)

    const mutate = async (credentials: { email: string; password: string }) => {
        setIsPending(true)
        setError(null)

        try {
            await loginUser(credentials)
            const authenticated = await refreshSession()

            if (!authenticated) {
                throw new Error("Unable to establish an authenticated session.")
            }

            toast.success("Login successful!")
            navigate("/dashboard")
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Login failed!"
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setIsPending(false)
        }
    }

    return { mutate, isPending, error }
}
