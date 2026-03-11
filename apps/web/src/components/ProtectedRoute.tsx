import type { RouteSectionProps } from "@solidjs/router"
import { Navigate } from "@solidjs/router"
import { Loader } from "lucide-solid"
import { Show } from "solid-js"
import { useAuthStore } from "../store/authStore"

const ProtectedRoute = (props: RouteSectionProps) => {
    const { isAuthenticated, isReady } = useAuthStore()

    return (
        <Show
            when={isReady()}
            fallback={
                <div class="flex min-h-screen items-center justify-center bg-background">
                    <Loader class="h-10 w-10 animate-spin text-primary" />
                </div>
            }
        >
            <Show when={isAuthenticated()} fallback={<Navigate href="/login" />}>
                {props.children}
            </Show>
        </Show>
    )
}

export default ProtectedRoute
