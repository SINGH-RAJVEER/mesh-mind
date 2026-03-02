import { createSignal, createEffect } from "solid-js";
import { makePersisted } from "@solid-primitives/storage";

interface User {
  id: string;
  username: string;
  email: string;
}

// Create persistent signals for auth state
const [user, setUser] = makePersisted(createSignal<User | null>(null), {
  name: "auth-user",
});
const [token, setToken] = makePersisted(createSignal<string | null>(null), {
  name: "auth-token",
});

export const useAuthStore = () => {
  const getIsAuthenticated = () => !!token();

  const updateAuth = (userData: User | null, authToken: string | null) => {
    setUser(userData);
    setToken(authToken);
    if (authToken) {
      localStorage.setItem("authToken", authToken);
    } else {
      localStorage.removeItem("authToken");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  return {
    user,
    token,
    isAuthenticated: getIsAuthenticated,
    setUser: updateAuth,
    logout,
  };
};
