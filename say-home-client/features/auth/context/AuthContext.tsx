"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { storage } from "@/shared/lib/storage";
import { authService } from "../services/auth.service";
import type {
  AuthUser,
  LoginPayload,
  SignupPayload,
} from "../types/auth.types";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setCurrentUser: (user: AuthUser) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token] = useState<string | null>(() => storage.getToken());
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
    }
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authService.login(payload);

      if (!response.user) {
        throw new Error("Invalid authentication response");
      }

      if (response.user.role === "CLIENT") {
        router.push("/");
        storage.setUser(response.user);
        setUser(response.user);
        toast.success(`Bienvenue a nouveau, ${response.user.firstName}`, {
          duration: 3000,
          position: "bottom-center",
        });
        return;
      }

      window.location.href = process.env.NEXT_PUBLIC_BACKOFFICE_URL!;
      toast.success("Redirection vers le back office", {
        duration: 3000,
        position: "bottom-center",
      });
    },
    [router],
  );

  const signup = useCallback(async (payload: SignupPayload) => {
    try {
      await authService.signup(payload);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant l'inscription.";
      toast.error(message, {
        duration: 3000,
        position: "bottom-center",
      });
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    storage.clearAuth();
    setUser(null);
    toast.success("Vous avez bien ete deconnecte.", {
      duration: 3000,
      position: "bottom-center",
    });
  }, []);

  const setCurrentUser = useCallback((nextUser: AuthUser) => {
    storage.setUser(nextUser);
    setUser(nextUser);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      }

      setIsLoading(false);
    };

    void init();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      refreshUser,
      setCurrentUser,
    }),
    [user, token, isLoading, login, signup, logout, refreshUser, setCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
