import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Only redirect if not already on login page
            if (!window.location.pathname.includes("/login")) {
              window.location.href = "/login";
            }
          }
          break;
        case 403:
          // Forbidden - insufficient permissions
          console.error("Access denied: Insufficient permissions");
          break;
        case 404:
          // Not found
          console.error("Resource not found");
          break;
        case 500:
          // Server error
          console.error("Server error occurred");
          break;
      }
    } else if (error.request) {
      // Network error - no response received
      console.error("Network error: Unable to reach server");
    }

    return Promise.reject(error);
  },
);

// API error interface for consistent error handling
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Helper to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    return (
      axiosError.response?.data?.message ||
      axiosError.message ||
      "An unexpected error occurred"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};
