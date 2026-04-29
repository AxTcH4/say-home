"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { isAdminRole } from "@/shared/lib/auth";
import { APP_ROUTES } from "@/shared/lib/routes";
import Link from "next/link";
interface UsersHeaderProps {
  total: number;
}

export function UsersHeader({ total }: UsersHeaderProps) {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-[42px] font-semibold tracking-[-0.03em] text-[#172033]">
          Users & Agents
        </h1>
        <p className="mt-2 text-sm text-[#70819a]">
          Manage roles and monitor team activity across the back-office.
        </p>
      </div>

      {isAdmin ? (
        <div className="flex items-center gap-3">
          <button className="rounded-[10px] border border-[#e4eaf4] bg-white px-4 py-2 text-sm font-semibold text-[#172033]">
            Filter
          </button>
          <Link href={APP_ROUTES.USERS_NEW} className="inline-flex items-center justify-center rounded-[10px] bg-[#2c1a0e] px-4 py-2 text-sm font-semibold text-white">
            Add User
          </Link>
        </div>
      ) : null}
    </div>
  );
}
