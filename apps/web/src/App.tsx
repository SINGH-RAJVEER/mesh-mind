import type { RouteSectionProps } from "@solidjs/router";
import { Router, Route, Navigate } from "@solidjs/router";
import Register from "./components/Register";
import Login from "./components/Login";
import GitHubCallback from "./components/GitHubCallback";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";
import { AuthProvider } from "./store/authStore";
import { ChatProvider } from "./store/chatStore";

const AppShell = (props: RouteSectionProps) => (
  <div className="min-h-screen bg-background">{props.children}</div>
);

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router root={AppShell}>
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/auth/github/callback" component={GitHubCallback} />

          <Route component={ProtectedRoute}>
            <Route path="/dashboard" component={Dashboard} />
          </Route>

          <Route path="/" component={() => <Navigate href="/login" />} />
        </Router>
        <Toast />
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
