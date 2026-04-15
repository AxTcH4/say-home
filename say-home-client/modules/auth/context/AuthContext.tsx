"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import { storage } from "@/lib/storage";
import { authService } from "../services/auth.service";
import type { AuthUser, LoginPayload, SignupPayload } from "../types/auth.types";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setCurrentUser: (user: AuthUser) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      storage.setUser(currentUser);
    } catch {
      storage.clearAuth();
      setUser(null);
      setToken(null);
    }
  };

  const login = async (payload: LoginPayload) => {
    const response = await authService.login(payload);

    if (!response.token || !response.user) {
      throw new Error("Invalid authentication response");
    }

    storage.setToken(response.token);
    storage.setUser(response.user);

    setToken(response.token);
    setUser(response.user);
  };

  const signup = async (payload: SignupPayload) => {
    await authService.signup(payload);
  };

  const logout = () => {
    storage.clearAuth();
    setToken(null);
    setUser(null);
  };

  const setCurrentUser = (user: AuthUser) => {
    storage.setUser(user);
    setUser(user);
  };

  useEffect(() => {
    const init = async () => {
      const savedToken = storage.getToken();
      const savedUser = storage.getUser<AuthUser>();

      if (savedToken) {
        setToken(savedToken);
      }

      if (savedUser) {
        setUser(savedUser);
      }

      if (savedToken) {
        await refreshUser();
      }

      setIsLoading(false);
    };

    init();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      isLoading,
      login,
      signup,
      logout,
      refreshUser,
      setCurrentUser,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
