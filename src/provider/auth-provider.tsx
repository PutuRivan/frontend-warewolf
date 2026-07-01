"use client";

import {
  useState,
  useEffect,
  ReactNode,
} from "react";

import { AuthContext, User, LoginData, RegisterData } from "../context/auth-context";
import * as authService from "@/service/auth.service";

interface Props {
  children: ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  async function refreshUser() {
    try {
      const me = await authService.getMe();

      setUser(me.user);
    } catch {
      setUser(null);
    }
  }

  async function login(data: LoginData) {
    const response = await authService.login(data);

    authService.setAccessToken(response.accessToken);

    if (!response) {
      return new Error("Error While Login")
    }

    setUser(response.user);
    return true

  }

  async function register(data: RegisterData) {
    const response = await authService.register(data);

    authService.setAccessToken(response.accessToken);

    setUser(response.user);
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      authService.clearAccessToken();
      setUser(null);
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