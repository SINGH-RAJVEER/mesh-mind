import axiosInstance from "./axiosInstance"

const authAPI = {
    // Sign up with email and password
    signUp: async (email: string, password: string, name?: string) => {
        const response = await axiosInstance.post("/auth/sign-up/email", {
            email,
            password,
            name,
        })
        return response.data
    },

    // Sign in with email and password
    signIn: async (email: string, password: string) => {
        const response = await axiosInstance.post("/auth/sign-in/email", {
            email,
            password,
        })
        return response.data
    },

    // Sign out
    signOut: async () => {
        const response = await axiosInstance.post("/auth/sign-out")
        return response.data
    },

    // Get current session
    getSession: async () => {
        const response = await axiosInstance.get("/auth/get-session")
        return response.data
    },

    // Get current user
    getMe: async () => {
        const response = await axiosInstance.get("/auth/me")
        return response.data
    },

    // Get OAuth provider URL
    getOAuthUrl: async (provider: "google" | "github", redirectTo = "/") => {
        const response = await axiosInstance.get(`/auth/oauth/url/${provider}`, {
            params: { redirect_to: redirectTo },
        })
        return response.data
    },

    // Start OAuth flow
    signInWithOAuth: async (provider: "google" | "github") => {
        const { authURL } = await authAPI.getOAuthUrl(provider, window.location.href)
        window.location.href = authURL
    },

    // Get redirect URL after OAuth callback
    getAuthRedirectUrl: (provider: string) => {
        return `${axiosInstance.defaults.baseURL || "http://localhost:8000"}/auth/oauth/callback/${provider}`
    },
}

export default authAPI
