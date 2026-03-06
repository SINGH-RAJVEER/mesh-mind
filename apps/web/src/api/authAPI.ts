import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const authAPI = {
  // Sign up with email and password
  signUp: async (email: string, password: string, name?: string) => {
    const response = await axios.post(`${API_BASE}/auth/sign-up`, {
      email,
      password,
      name,
    });
    return response.data;
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE}/auth/sign-in`, {
      email,
      password,
    });
    return response.data;
  },

  // Sign out
  signOut: async () => {
    const response = await axios.post(`${API_BASE}/auth/sign-out`);
    return response.data;
  },

  // Get current session
  getSession: async () => {
    const response = await axios.get(`${API_BASE}/auth/session`, {
      withCredentials: true,
    });
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await axios.get(`${API_BASE}/auth/me`, {
      withCredentials: true,
    });
    return response.data;
  },

  // Get OAuth provider URL
  getOAuthUrl: async (provider: "google" | "github", redirectTo = "/") => {
    const response = await axios.get(`${API_BASE}/auth/oauth/url/${provider}`, {
      params: { redirect_to: redirectTo },
    });
    return response.data;
  },

  // Start OAuth flow
  signInWithOAuth: async (provider: "google" | "github") => {
    const { authURL } = await authAPI.getOAuthUrl(provider, window.location.href);
    window.location.href = authURL;
  },

  // Get redirect URL after OAuth callback
  getAuthRedirectUrl: (provider: string) => {
    return `${API_BASE}/auth/oauth/callback/${provider}`;
  },
};

export default authAPI;
