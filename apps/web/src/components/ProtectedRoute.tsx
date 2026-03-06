import { createSignal, Show, onMount } from "solid-js";
import { Navigate, Outlet } from "@solidjs/router";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = () => {
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
      <Outlet />
    </Show>
  );
};

export default ProtectedRoute;
