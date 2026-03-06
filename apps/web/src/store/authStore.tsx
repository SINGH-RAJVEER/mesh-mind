import { createSignal, createContext, useContext, type JSX } from "solid-js";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: () => User | null;
  token: () => string | null;
  isAuthenticated: () => boolean;
  updateAuth: (userData: User | null, authToken: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>();

export function AuthProvider(props: { children: JSX.Element }) {
  const [user, setUser] = createSignal<User | null>(null);
  const [token, setToken] = createSignal<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("auth-token") : null,
  );

  const updateAuth = (userData: User | null, authToken: string | null) => {
    setUser(userData);
    setToken(authToken);

    if (authToken) {
      localStorage.setItem("auth-token", authToken);
    } else {
      localStorage.removeItem("auth-token");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth-token");
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: () => !!token(),
    updateAuth,
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
