"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { hasManagementAccess, isAdminRole } from "@/shared/lib/auth";
import { prospectService } from "../services/prospect.service";
import type { ProspectDetail } from "../types/prospect.types";

interface ProspectDetailHeaderProps {
  prospect: ProspectDetail;
}

const temperatureLabels = {
  HOT: "Hot",
  WARM: "Warm",
  COLD: "Cold",
};

const temperatureStyles = {
  HOT: "bg-[#ffe7e1] text-[#d24a2f]",
  WARM: "bg-[#fff3d6] text-[#b77708]",
  COLD: "bg-[#e5eefc] text-[#376fd9]",
};

const statusStyles: Record<string, string> = {
  NEW: "bg-[#fff2bf] text-[#a56c00]",
  CONTACTED: "bg-[#dfe9ff] text-[#2f66da]",
  QUALIFIED: "bg-[#dff6e6] text-[#279255]",
  NEGOTIATING: "bg-[#f1e0ff] text-[#7a35c8]",
  CONVERTED: "bg-[#d9f7ef] text-[#0f9f6e]",
  LOST: "bg-[#ffe1e1] text-[#d24a4a]",
};

export function ProspectDetailHeader({ prospect }: ProspectDetailHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const canManage = hasManagementAccess(user?.role);
  const isAdmin = isAdminRole(user?.role);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete ${prospect.fullName}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await prospectService.deleteProspect(prospect.id);
      toast.success("Prospect deleted successfully.");
      router.push("/prospects");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete prospect.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-[18px] border border-[#e7edf5] bg-white px-6 py-6 shadow-[0_12px_35px_rgba(20,32,60,0.06)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f6fb]">
              <img src="/agent.svg" alt="" className="h-7 w-7 opacity-70" />
            </div>
            <div>
              <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-[#172033]">
                {prospect.fullName}
              </h1>
              <p className="text-sm text-[#70819a]">
                Prospect dashboard and activity overview
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={`rounded-full px-3 py-1 font-semibold ${statusStyles[prospect.status]}`}>
              {prospect.status}
            </span>
            <span className="rounded-full bg-[#edf3ff] px-3 py-1 font-semibold text-[#376fd9]">
              AI Score {prospect.aiScore}%
            </span>
            <span
              className={`rounded-full px-3 py-1 font-semibold ${temperatureStyles[prospect.temperature]}`}
            >
              {temperatureLabels[prospect.temperature]}
            </span>
          </div>
        </div>

        {canManage ? (
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/prospects/${prospect.id}/edit`}
              className="rounded-[10px] border border-[#e4eaf4] px-4 py-2 text-sm font-semibold text-[#172033] transition hover:bg-[#f7f9fc]"
            >
              Edit
            </Link>
            {isAdmin ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-[10px] border border-[#ffe1e1] px-4 py-2 text-sm font-semibold text-[#d24a4a] transition hover:bg-[#fff5f5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            ) : null}
            <Link
              href={`/appointments/new?prospectId=${prospect.id}`}
              className="rounded-[10px] bg-[#2c1a0e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3a2416]"
            >
              Add Meeting
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
