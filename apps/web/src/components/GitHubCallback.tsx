import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import axiosInstance from "../api/axiosInstance";
import { showToast } from "./Toast";

function GitHubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  useEffect(() => {
    const handleCallback = async () => {
      if (error) {
        showToast(`GitHub auth error: ${error}`, "error");
        navigate("/login");
        return;
      }

      if (!code) {
        showToast("No authorization code received", "error");
        navigate("/login");
        return;
      }

      try {
        const response = await axiosInstance.post("/auth/github/callback", {
          code,
        });

        localStorage.setItem("authToken", response.data.access_token);
        showToast(`Welcome, ${response.data.user.username}!`, "success");
        navigate("/dashboard");
      } catch (err: any) {
        showToast(
          error?.response?.data?.detail || "GitHub authentication failed",
          "error",
        );
        navigate("/login");
      }
    };

    handleCallback();
  }, [code, error, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <FaSpinner className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-foreground text-lg">Connecting with GitHub...</p>
      </div>
    </div>
  );
}

export default GitHubCallback;
