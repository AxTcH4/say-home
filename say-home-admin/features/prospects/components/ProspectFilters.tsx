"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { hasManagementAccess } from "@/shared/lib/auth";
import { APP_ROUTES } from "@/shared/lib/routes";
import Link from "next/link";
import type { ProspectListFilters } from "../types/prospect.types";

interface ProspectFiltersProps {
  filters: ProspectListFilters;
}

export function ProspectFilters({ filters }: ProspectFiltersProps) {
  const { user } = useAuth();
  const canManage = hasManagementAccess(user?.role);

  return (
    <div className="rounded-[14px] border border-[#e7edf5] bg-white px-4 py-3 shadow-[0_12px_35px_rgba(20,32,60,0.06)]">
      <form className="flex flex-col gap-3 lg:flex-row">
        <div className="flex min-h-12 flex-1 items-center gap-3 rounded-[10px] bg-[#f6f8fc] px-4 text-sm text-[#70819a]">
          <img src="/search.svg" alt="" className="h-4 w-4 opacity-60" />
          <input
            type="search"
            name="search"
            placeholder="Search prospects..."
            className="w-full bg-transparent outline-none placeholder:text-[#8fa0b8]"
          />
        </div>

        <select
          name="status"
          className="min-h-12 rounded-[10px] border border-[#e7edf5] px-4 text-sm text-[#172033] outline-none"
          defaultValue=""
        >
          <option value="">Pipeline Status</option>
          {filters.statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          name="assignedAgent"
          className="min-h-12 rounded-[10px] border border-[#e7edf5] px-4 text-sm text-[#172033] outline-none"
          defaultValue=""
        >
          <option value="">Assigned Agent</option>
          {filters.assignedAgents.map((agent) => (
            <option key={agent} value={agent}>
              {agent}
            </option>
          ))}
        </select>

        <select
          name="source"
          className="min-h-12 rounded-[10px] border border-[#e7edf5] px-4 text-sm text-[#172033] outline-none"
          defaultValue=""
        >
          <option value="">Source</option>
          {filters.sources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>

        {canManage ? (
          <Link
            href={APP_ROUTES.PROSPECTS_NEW}
            className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-[10px] bg-[#2c1a0e] px-5 text-sm font-semibold text-white transition hover:bg-[#3a2415]"
          >
            Add Prospect
          </Link>
        ) : null}
      </form>
    </div>
  );
}
