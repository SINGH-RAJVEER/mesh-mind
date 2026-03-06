import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import authAPI from "../api/authAPI";
import { useAuthStore } from "../store/authStore";
import { toast } from "../components/Toast";

export const useLogout = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [isPending, setIsPending] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const mutate = async () => {
    setIsPending(true);
    setError(null);

    try {
      await authAPI.signOut();
      logout();
      toast.success("Logout Successful");
      navigate("/login");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Logout failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
};
