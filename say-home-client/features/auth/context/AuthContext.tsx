"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import { storage } from "@/shared/lib/storage";
import { authService } from "../services/auth.service";
import type {
  AuthUser,
  LoginPayload,
  LogoutPayload,
  SignupPayload,
} from "../types/auth.types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";




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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      storage.setUser(currentUser);
    } catch {
      storage.clearAuth();
      setUser(null);
    }
  };

  const login = async (payload: LoginPayload) => {
    const response = await authService.login(payload);

    if (!response.user) {
      throw new Error("Invalid authentication response");
    }

    if (response.user.role === "CLIENT") {
      router.push("/");
      storage.setUser(response.user);

      setUser(response.user);
      toast.success("Bienvenue à nouveau, " + response.user.firstName, {
        duration: 3000,
        position: "bottom-center",
      });
    } else {
      window.location.href = process.env.NEXT_PUBLIC_BACKOFFICE_URL!;
      toast.success("redireiction vers back office", {
        duration: 3000,
        position: "bottom-center",
      });
    return
    }
  };

  const signup = async (payload: SignupPayload) => {
    try {
      await authService.signup(payload);
    } catch (error: any) {
      toast.error(error.response.data.message, {
        duration: 3000,
        position: "bottom-center",
      });
    }
  };

  const logout = async () => {
    await authService.logout();

    storage.clearAuth();
    // setToken(null);
    setUser(null);
    toast.success("Vous avez bien vous deconnecté!", {
      duration: 3000,
      position: "bottom-center",
    });
  };

  const setCurrentUser = (user: AuthUser) => {
    storage.setUser(user);
    setUser(user);
  };
useEffect(() => {
    const init = async () => {
      try {
        const user = await authService.getCurrentUser(); // uses HttpOnly cookie
        setUser(user);
      } catch {
        setUser(null);
      }

      setIsLoading(false);
    };

    init();
  }, []);


  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !! user,
      isLoading,
      login,
      signup,
      logout,
      refreshUser,
      setCurrentUser,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
