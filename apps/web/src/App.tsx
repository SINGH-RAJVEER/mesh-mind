import { Router, Route, Routes, Navigate } from "@solidjs/router";
import Register from "./components/Register";
import Login from "./components/Login";
import GitHubCallback from "./components/GitHubCallback";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";
import { AuthProvider } from "./store/authStore";
import { ChatProvider } from "./store/chatStore";

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/register" component={Register} />
              <Route path="/login" component={Login} />
              <Route path="/auth/github/callback" component={GitHubCallback} />

              <Route component={ProtectedRoute}>
                <Route path="/dashboard" component={Dashboard} />
              </Route>

              <Route path="/" component={() => <Navigate href="/login" />} />
            </Routes>
          </div>
        </Router>
        <Toast />
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
