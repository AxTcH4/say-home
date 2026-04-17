"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/shared/lib/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function PublicOnlyRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(APP_ROUTES.HOME);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-neutral-600">
        Chargement...
      </div>
    );
  }

  return <>{children}</>;
}