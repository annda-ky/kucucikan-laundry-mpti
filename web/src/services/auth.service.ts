import { apiClient, getErrorMessage } from "@/lib/api-client";
import type { AuthResponse, LoginCredentials } from "@/types";

export const authService = {
  /**
   * Login with username and PIN
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      username: credentials.username,
      pin: credentials.pin,
    });
    return response.data;
  },

  /**
   * Logout - clear local storage
   */
  logout: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("token");
    }
    return false;
  },

  /**
   * Check if current user is Owner
   */
  isOwner: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === "OWNER";
  },

  /**
   * Check if current user is Admin
   */
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === "ADMIN";
  },
};
