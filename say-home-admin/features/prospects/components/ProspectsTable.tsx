/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ProspectActionsMenu } from "./ProspectActionsMenu";
import type { ProspectListItem } from "../types/prospect.types";

interface ProspectsTableProps {
  prospects: ProspectListItem[];
  page: number;
  pageSize: number;
  total: number;
  searchParams?: {
    search?: string;
    status?: string;
    assignedAgent?: string;
    source?: string;
  };
}

const statusStyles: Record<string, string> = {
  NEW: "bg-[#fff2bf] text-[#a56c00]",
  CONTACTED: "bg-[#dfe9ff] text-[#2f66da]",
  QUALIFIED: "bg-[#dff6e6] text-[#279255]",
  NEGOTIATING: "bg-[#f1e0ff] text-[#7a35c8]",
  CONVERTED: "bg-[#d9f7ef] text-[#0f9f6e]",
  LOST: "bg-[#ffe1e1] text-[#d24a4a]",
};

function scoreWidth(score: number) {
  return `${Math.max(8, Math.min(score, 100))}%`;
}

export function ProspectsTable({
  prospects,
  page,
  pageSize,
  total,
  searchParams,
}: ProspectsTableProps) {
  const from = prospects.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = (page - 1) * pageSize + prospects.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (searchParams?.search) params.set("search", searchParams.search);
    if (searchParams?.status) params.set("status", searchParams.status);
    if (searchParams?.assignedAgent) params.set("assignedAgent", searchParams.assignedAgent);
    if (searchParams?.source) params.set("source", searchParams.source);
    params.set("page", String(targetPage));
    return `/prospects?${params.toString()}`;
  };

  const visiblePages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => index + 1,
  );

  return (
    <div className="overflow-hidden rounded-[16px] border border-[#e7edf5] bg-white shadow-[0_12px_35px_rgba(20,32,60,0.06)]">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-[#edf2f8] bg-[#fbfcfe] text-left text-[12px] uppercase tracking-[0.08em] text-[#7d8ca2]">
            <tr>
              <th className="px-5 py-4 font-semibold">Prospect</th>
              <th className="px-5 py-4 font-semibold">Phone</th>
              <th className="px-5 py-4 font-semibold">City</th>
              <th className="px-5 py-4 font-semibold">Budget</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">AI Score</th>
              <th className="px-5 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((prospect) => (
              <tr
                key={prospect.id}
                className="border-b border-[#edf2f8] text-sm text-[#172033] last:border-b-0"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f6fb]">
                      <img src="/agent.svg" alt="" className="h-5 w-5 opacity-70" />
                    </div>
                    <div>
                      <p className="font-semibold">{prospect.fullName}</p>
                      <p className="text-xs text-[#7d8ca2]">{prospect.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-[#52627b]">{prospect.phone}</td>
                <td className="px-5 py-4 text-[#52627b]">{prospect.city}</td>
                <td className="px-5 py-4 font-medium">{prospect.budgetLabel}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                      statusStyles[prospect.status]
                    }`}
                  >
                    {prospect.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-16 rounded-full bg-[#e8eef7]">
                      <div
                        className="h-1.5 rounded-full bg-[#3d7cf4]"
                        style={{ width: scoreWidth(prospect.aiScore) }}
                      />
                    </div>
                    <span className="font-semibold">{prospect.aiScore}%</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3 text-[#61728b]">
                    <Link
                      href={`/prospects/${prospect.id}`}
                      className="rounded-full border border-[#e4eaf4] px-3 py-1 text-xs font-medium hover:bg-[#f7f9fc]"
                    >
                      Detail
                    </Link>
                    <ProspectActionsMenu
                      prospectId={prospect.id}
                      prospectName={prospect.fullName}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-[#edf2f8] px-5 py-4 text-sm text-[#70819a] md:flex-row md:items-center md:justify-between">
        <p>
          Showing {from} to {to} of {total.toLocaleString()} prospects
        </p>

        <div className="flex items-center gap-2">
          <Link
            href={buildPageHref(Math.max(1, page - 1))}
            aria-disabled={page === 1}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[#61728b] ${
              page === 1
                ? "pointer-events-none border-[#eef2f7] text-[#c2ccda]"
                : "border-[#e4eaf4] hover:bg-[#f7f9fc]"
            }`}
          >
            {"<"}
          </Link>
          {visiblePages.map((pageNumber) => (
            <Link
              key={pageNumber}
              href={buildPageHref(pageNumber)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                pageNumber === page
                  ? "border-[#2c1a0e] bg-[#2c1a0e] text-white"
                  : "border-[#e4eaf4] text-[#61728b] hover:bg-[#f7f9fc]"
              }`}
            >
              {pageNumber}
            </Link>
          ))}
          {totalPages > visiblePages.length ? (
            <span className="px-1 text-[#9aa7bb]">...</span>
          ) : null}
          {totalPages > visiblePages.length ? (
            <Link
              href={buildPageHref(totalPages)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                totalPages === page
                  ? "border-[#2c1a0e] bg-[#2c1a0e] text-white"
                  : "border-[#e4eaf4] text-[#61728b] hover:bg-[#f7f9fc]"
              }`}
            >
              {totalPages}
            </Link>
          ) : null}
          <Link
            href={buildPageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page === totalPages}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[#61728b] ${
              page === totalPages
                ? "pointer-events-none border-[#eef2f7] text-[#c2ccda]"
                : "border-[#e4eaf4] hover:bg-[#f7f9fc]"
            }`}
          >
            {">"}
          </Link>
        </div>
      </div>
    </div>
  );
}
