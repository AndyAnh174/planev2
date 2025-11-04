import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import api from "@/lib/api";

export function useAuth() {
  const { user, isAuthenticated, login, logout, setUser, refreshToken } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated by verifying token
    const accessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    
    if (accessToken && storedRefreshToken && !isAuthenticated) {
      // Try to fetch user profile to verify token is still valid
      api
        .get("/auth/profile")
        .then((response) => {
          const userData = response.data;
          // Restore user state if token is valid
          setUser(userData);
          useAuthStore.setState({
            user: userData,
            isAuthenticated: true,
            accessToken,
            refreshToken: storedRefreshToken,
          });
        })
        .catch(() => {
          // Token invalid, clear storage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        });
    } else if (!accessToken || !storedRefreshToken) {
      // No tokens, ensure user is logged out
      if (isAuthenticated) {
        logout();
      }
    }
  }, [isAuthenticated, setUser, logout]);

  return {
    user,
    isAuthenticated,
    login,
    logout,
    setUser,
    refreshToken,
  };
}

