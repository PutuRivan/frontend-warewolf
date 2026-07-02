"use client";

import {
  useState,
  useEffect,
  ReactNode,
} from "react";

import { AuthContext, User, LoginData, RegisterData } from "../context/auth.context";
import * as authService from "@/lib/api/auth.service";
import { useGameStore } from "@/lib/store/useGameStore";

interface Props {
  children: ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Sync React user state from AuthProvider to Zustand gameStore user state
  useEffect(() => {
    if (user) {
      useGameStore.setState({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          token: authService.getAccessToken() || "mock-jwt-token",
          point: user.point ?? 500,
          coin: user.coin ?? 0,
          level: user.level ?? 1,
          exp: user.exp ?? 0,
        }
      });
    } else {
      useGameStore.setState({ user: null });
    }
  }, [user]);

  async function refreshUser() {
    try {
      const me = await authService.getMe();
      setUser(me.user);

      // Redirect to lobby if currently on landing/auth view
      const currentView = useGameStore.getState().view;
      if (currentView === "landing" || currentView === "auth") {
        useGameStore.getState().setView("lobby");
      }
    } catch {
      setUser(null);
    }
  }

  async function login(data: LoginData) {
    const response = await authService.login(data);

    if (!response || !response.user) {
      throw new Error("Gagal mendapatkan data user setelah login");
    }

    setLoading(true);
    try {
      authService.setAccessToken(response.accessToken);
      
      // Artificial delay for loading transition
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setUser(response.user);
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function register(data: RegisterData) {
    const response = await authService.register(data);

    setLoading(true);
    try {
      authService.setAccessToken(response.accessToken);

      // Artificial delay for loading transition
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setUser(response.user);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      // Artificial delay for logout transition
      await new Promise((resolve) => setTimeout(resolve, 1000));

      authService.clearAccessToken();
      authService.clearRefreshToken();
      setUser(null);
      useGameStore.getState().logout();
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
