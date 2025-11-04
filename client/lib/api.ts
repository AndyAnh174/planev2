import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor để thêm auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Don't add auth header for public endpoints
    const isPublicEndpoint = config.url?.includes("/pages/public/") || 
                             config.url?.includes("/auth/") ||
                             config.url?.includes("/public/");
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refreshToken từ localStorage
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call /auth/refresh với refreshToken
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens trong localStorage và store
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Update auth store if available
        if (typeof window !== "undefined") {
          const { useAuthStore } = await import("@/store/authStore");
          useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
        }

        // Retry original request với new accessToken
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const pagesApi = {
  getPublicPage: async (slug: string) => {
    const response = await api.get(`/pages/public/${slug}`);
    return response.data;
  },
};

export default api;

