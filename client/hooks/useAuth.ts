import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export function useAuth() {
  const { user, isAuthenticated, login, logout, setUser } = useAuthStore();

  useEffect(() => {
    // TODO: Check if user is authenticated by verifying token
    const token = localStorage.getItem("accessToken");
    if (token && !isAuthenticated) {
      // TODO: Fetch user data from API
      // For now, just check token exists
    }
  }, [isAuthenticated]);

  return {
    user,
    isAuthenticated,
    login,
    logout,
    setUser,
  };
}

