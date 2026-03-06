import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { registerUser } from "../api/authApi";
import { toast } from "../components/Toast";

export const useRegister = () => {
  const navigate = useNavigate();
  const [isPending, setIsPending] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const mutate = async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    setIsPending(true);
    setError(null);

    try {
      const data = await registerUser(userData);
      toast.success(data.message || "Registration successful!");
      navigate("/login");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Registration failed!";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
};
