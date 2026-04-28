"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { meetingService } from "@/features/meetings/services/meeting.service";
import { hasManagementAccess } from "@/shared/lib/auth";
import type { MeetingRequestItem } from "../types/meeting.types";

interface MeetingRequestsProps {
  requests: MeetingRequestItem[];
}

export function MeetingRequests({ requests }: MeetingRequestsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const canManage = hasManagementAccess(user?.role);
  const [loadingRequestId, setLoadingRequestId] = useState<number | null>(null);

  const handleApprove = async (requestId: number) => {
    try {
      setLoadingRequestId(requestId);
      await meetingService.approveRequest(requestId);
      toast.success("Meeting request accepted.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to accept request");
    } finally {
      setLoadingRequestId(null);
    }
  };

  const handleRefuse = async (requestId: number) => {
    try {
      setLoadingRequestId(requestId);
      await meetingService.refuseRequest(requestId);
      toast.success("Meeting request refused.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to refuse request");
    } finally {
      setLoadingRequestId(null);
    }
  };

  return (
    <section className="rounded-[18px] border border-[#e7edf5] bg-white p-5 shadow-[0_12px_35px_rgba(20,32,60,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#172033]">Meeting Requests</h2>
          <p className="mt-1 text-sm text-[#70819a]">
            Client requests waiting for admin review and confirmation.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {requests.length === 0 ? (
          <p className="text-sm text-[#70819a]">No meeting requests for now.</p>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="rounded-[14px] border border-[#edf2f8] bg-[#fbfcfe] p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#172033]">{request.prospectName}</p>
                    <span className="text-sm text-[#70819a]">{request.city}</span>
                  </div>
                  <p className="text-sm font-medium text-[#2c1a0e]">{request.propertyTitle}</p>
                  <p className="text-sm text-[#61728b]">
                    {request.budgetLabel} · Requested for {request.requestedDate} at {request.requestedTime}
                  </p>
                  <p className="text-sm text-[#70819a]">{request.message || "No additional message."}</p>
                </div>

                <div className="flex flex-wrap justify-end gap-2 lg:max-w-[460px]">
                  <Link
                    href={`/prospects/${request.prospectId}`}
                    className="rounded-[10px] border border-[#e4eaf4] px-3 py-2 text-sm font-semibold text-[#172033]"
                  >
                    View Prospect
                  </Link>
                  {canManage ? (
                    <>
                      <button
                        type="button"
                        disabled={loadingRequestId === request.id}
                        onClick={() => handleApprove(request.id)}
                        className="inline-flex min-h-10 items-center justify-center rounded-[10px] border border-[#2c1a0e] px-4 py-2 text-sm font-semibold text-[#2c1a0e] disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={loadingRequestId === request.id}
                        onClick={() => handleRefuse(request.id)}
                        className="inline-flex min-h-10 items-center justify-center rounded-[10px] border border-[#e4eaf4] px-4 py-2 text-sm font-semibold text-[#172033] disabled:opacity-60"
                      >
                        Refuse
                      </button>
                      <Link
                        href={`/appointments/${request.id}/edit`}
                        className="inline-flex min-h-10 items-center justify-center rounded-[10px] bg-[#2c1a0e] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Review & Plan
                      </Link>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
