import { onMount } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { Loader } from "lucide";
import axiosInstance from "../api/axiosInstance";
import { toast } from "./Toast";

function GitHubCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = () => searchParams.code;
  const error = () => searchParams.error;

  onMount(() => {
    const handleCallback = async () => {
      if (error()) {
        toast.error(`GitHub auth error: ${error()}`);
        navigate("/login");
        return;
      }

      if (!code()) {
        toast.error("No authorization code received");
        navigate("/login");
        return;
      }

      try {
        const response = await axiosInstance.post("/auth/github/callback", {
          code: code(),
        });

        localStorage.setItem("authToken", response.data.access_token);
        toast.success(`Welcome, ${response.data.user.username}!`);
        navigate("/dashboard");
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "GitHub authentication failed";
        toast.error(errorMessage);
        navigate("/login");
      }
    };

    handleCallback();
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-foreground font-medium">
          Completing authentication...
        </p>
      </div>
    </div>
  );
}

export default GitHubCallback;
