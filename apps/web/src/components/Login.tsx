import { createSignal, Show } from "solid-js";
import { A } from "@solidjs/router";
import { Heart, Github } from "lucide";
import { useLogin } from "../hooks/useLogin";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { toast } from "./Toast";

function Login() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [isLoadingOAuth, setIsLoadingOAuth] = createSignal(false);
  const { mutate: loginMutate, isPending } = useLogin();

  const handleLogin = (e: Event) => {
    e.preventDefault();
    loginMutate({ email: email(), password: password() });
  };

  const handleGitHubLogin = async () => {
    try {
      setIsLoadingOAuth(true);
      const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const REDIRECT_URI = `${window.location.origin}/auth/github/callback`;

      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email`;
      window.location.href = githubAuthUrl;
    } catch (_error) {
      toast.error("Failed to redirect to GitHub");
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
            <Heart className="h-12 w-12 text-primary" />
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
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              className="rounded-lg"
            />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              className="rounded-lg"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-lg"
            disabled={isPending() || isLoadingOAuth()}
          >
            {isPending() ? "Signing in..." : "Sign in with email"}
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
          <Show when={GOOGLE_CLIENT_ID}>
            <div id="google-oauth-container" className="w-full" />
          </Show>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-lg flex items-center justify-center gap-2"
            onClick={handleGitHubLogin}
            disabled={isLoadingOAuth() || isPending()}
          >
            <Github className="h-5 w-5" />
            GitHub
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <A
              href="/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </A>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
