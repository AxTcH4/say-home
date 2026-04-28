import { redirect } from "next/navigation";
import { apiFetch } from "./api-fetch";
import { APP_ROUTES } from "./routes";
import type { AuthUser } from "@/features/auth/types/auth.types";

const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api";

export async function getServerAuthUser(): Promise<AuthUser | null> {
  const response = await apiFetch(`${API_BASE_URL}/auth/me`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as AuthUser;
}

export async function requireAdminUser() {
  const user = await getServerAuthUser();

  if (!user) {
    redirect(APP_ROUTES.LOGIN);
  }

  if (user.role !== "ADMIN") {
    redirect(APP_ROUTES.APPOINTMENTS);
  }

  return user;
}

