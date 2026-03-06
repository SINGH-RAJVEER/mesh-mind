import {
  createSignal,
  createContext,
  onMount,
  useContext,
  type JSX,
} from "solid-js";
import authAPI from "../api/authAPI";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: () => User | null;
  token: () => string | null;
  isReady: () => boolean;
  isAuthenticated: () => boolean;
  updateAuth: (userData: User | null, authToken: string | null) => void;
  refreshSession: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>();

export function AuthProvider(props: { children: JSX.Element }) {
  const [user, setUser] = createSignal<User | null>(null);
  const [token, setToken] = createSignal<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("auth-token") : null,
  );
  const [sessionAuthenticated, setSessionAuthenticated] = createSignal(false);
  const [isReady, setIsReady] = createSignal(false);

  const normalizeUser = (userData: {
    id: string;
    email: string;
    username?: string | null;
    name?: string | null;
  }): User => ({
    id: userData.id,
    email: userData.email,
    username:
      userData.username ||
      userData.name ||
      userData.email.split("@")[0] ||
      "MindScribe User",
  });

  const updateAuth = (userData: User | null, authToken: string | null) => {
    setUser(userData);
    setToken(authToken);
    setSessionAuthenticated(Boolean(userData) || Boolean(authToken));

    if (authToken) {
      localStorage.setItem("auth-token", authToken);
    } else {
      localStorage.removeItem("auth-token");
    }
  };

  const refreshSession = async () => {
    try {
      const sessionUser = await authAPI.getMe();

      setUser(normalizeUser(sessionUser));
      setSessionAuthenticated(true);
      return true;
    } catch (_error) {
      setSessionAuthenticated(false);

      if (!token()) {
        setUser(null);
      }

      return false;
    } finally {
      setIsReady(true);
    }
  };

  onMount(() => {
    void refreshSession();
  });

  const logout = () => {
    setUser(null);
    setToken(null);
    setSessionAuthenticated(false);
    localStorage.removeItem("auth-token");
  };

  const value: AuthContextType = {
    user,
    token,
    isReady,
    isAuthenticated: () => sessionAuthenticated() || !!token(),
    updateAuth,
    refreshSession,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}

export function useAuthStore() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthStore must be used within AuthProvider");
  }
  return context;
}
