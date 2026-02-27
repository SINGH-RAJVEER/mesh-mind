import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FaGithub, FaHeartbeat } from "react-icons/fa";
import { useRegister } from "../hooks/useRegister";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import axiosInstance from "../api/axiosInstance";
import { showToast } from "./Toast";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoadingOAuth, setIsLoadingOAuth] = useState(false);
  const { mutate: registerMutate, isPending } = useRegister();
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    registerMutate({ username, email, password });
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoadingOAuth(true);
      const response = await axiosInstance.post("/auth/google/callback", {
        token: credentialResponse.credential,
      });

      localStorage.setItem("authToken", response.data.access_token);
      showToast(`Welcome, ${response.data.user.username}!`, "success");
      navigate("/dashboard");
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || "Google signup failed",
        "error",
      );
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
          <h2 className="text-3xl font-bold text-foreground">Create account</h2>
          <p className="mt-2 text-muted-foreground">
            Start your journey to better mental wellness
          </p>
        </div>

        {/* Email & Password Form */}
        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="space-y-3">
            <Input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-lg"
            />
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
              autoComplete="new-password"
              required
              placeholder="Password (min 8 chars, uppercase, number)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg"
            />
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-lg"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-lg"
            disabled={isPending || isLoadingOAuth}
          >
            {isPending ? "Creating account..." : "Sign up with email"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">
              Or sign up with
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
                  onError={() => showToast("Google signup failed", "error")}
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

        {/* Login Link */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
