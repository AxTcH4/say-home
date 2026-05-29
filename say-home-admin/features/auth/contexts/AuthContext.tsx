"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { storage } from "@/shared/lib/storage";
import { authService } from "../services/auth.service";
import type { AuthUser, LoginPayload } from "../types/auth.types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/shared/lib/routes";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setCurrentUser: (user: AuthUser) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      storage.setUser(currentUser);
    } catch {
      storage.clearAuth();
      setUser(null);
      setToken(null);
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload);

    if (!response.user) {
      throw new Error("Invalid authentication response");
    }

    if (response.user.role === "CLIENT") {
      window.location.href = process.env.NEXT_PUBLIC_FRONTOFFICE_URL!;
      toast.success("redirection vers espace client", {
        duration: 3000,
        position: "bottom-center",
      });
      return;
    }

    storage.setUser(response.user);
    setUser(response.user);
    router.push(APP_ROUTES.HOME);
    toast.success("Bienvenue a nouveau, " + response.user.firstName, {
      duration: 3000,
      position: "bottom-center",
    });
  }, [router]);

  const logout = useCallback(async () => {
    await authService.logout();

    storage.clearAuth();
    setUser(null);
    setToken(null);
    toast.success("Vous avez bien vous deconnecte !", {
      duration: 3000,
      position: "bottom-center",
    });
    router.push(APP_ROUTES.LOGIN);
  }, [router]);

  const setCurrentUser = useCallback((currentUser: AuthUser) => {
    storage.setUser(currentUser);
    setUser(currentUser);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
        setToken(null);
      }

      setIsLoading(false);
    };

    init();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refreshUser,
      setCurrentUser,
    }),
    [user, token, isLoading, login, logout, refreshUser, setCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
