import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FaGithub, FaHeartbeat } from "react-icons/fa";
import { useLogin } from "../hooks/useLogin";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import axiosInstance from "../api/axiosInstance";
import { showToast } from "./Toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoadingOAuth, setIsLoadingOAuth] = useState(false);
  const { mutate: loginMutate, isPending } = useLogin();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutate({ email, password });
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoadingOAuth(true);
      const response = await axiosInstance.post("/auth/google/callback", {
        token: credentialResponse.credential,
      });

      localStorage.setItem("authToken", response.data.access_token);
      showToast(`Welcome back, ${response.data.user.username}!`, "success");
      navigate("/dashboard");
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Google login failed", "error");
    } finally {
      setIsLoadingOAuth(false);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      setIsLoadingOAuth(true);
      const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const REDIRECT_URI = `${window.location.origin}/auth/github/callback`;

      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email`;
      window.location.href = githubAuthUrl;
    } catch (error) {
      showToast("Failed to redirect to GitHub", "error");
      setIsLoadingOAuth(false);
    }
  };

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!GOOGLE_CLIENT_ID) {
    console.warn("VITE_GOOGLE_CLIENT_ID is not set");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <FaHeartbeat className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
          <p className="mt-2 text-muted-foreground">
            Sign in to continue your mental wellness journey
          </p>
        </div>

        {/* Email & Password Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-3">
            <Input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg"
            />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-lg"
            disabled={isPending || isLoadingOAuth}
          >
            {isPending ? "Signing in..." : "Sign in with email"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          {GOOGLE_CLIENT_ID ? (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => showToast("Google login failed", "error")}
                  width="100%"
                />
              </div>
            </GoogleOAuthProvider>
          ) : null}

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-lg flex items-center justify-center gap-2"
            onClick={handleGitHubLogin}
            disabled={isLoadingOAuth || isPending}
          >
            <FaGithub className="h-5 w-5" />
            GitHub
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
