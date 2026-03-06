import type { RouteSectionProps } from "@solidjs/router";
import { Navigate } from "@solidjs/router";
import { createSignal, Show, onMount } from "solid-js";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = (props: RouteSectionProps) => {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    setMounted(true);
  });

  return (
    <Show
      when={mounted() && isAuthenticated()}
      fallback={<Navigate href="/login" />}
    >
      {props.children}
    </Show>
  );
};

export default ProtectedRoute;
