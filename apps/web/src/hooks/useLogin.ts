import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { loginUser } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import { toast } from "../components/Toast";

export const useLogin = () => {
  const navigate = useNavigate();
  const { updateAuth } = useAuthStore();
  const [isPending, setIsPending] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const mutate = async (credentials: { email: string; password: string }) => {
    setIsPending(true);
    setError(null);

    try {
      const data = await loginUser(credentials);
      const { user, access_token } = data;

      updateAuth(user, access_token);

      toast.success(data.message || "Login successful!");
      navigate("/dashboard");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Login failed!";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
};
