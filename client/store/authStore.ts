import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  gitlabId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  accessToken: null,
  login: (user, token) => {
    localStorage.setItem("accessToken", token);
    set({ user, isAuthenticated: true, accessToken: token });
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    set({ user: null, isAuthenticated: false, accessToken: null });
  },
  setUser: (user) => set({ user }),
}));

