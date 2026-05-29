"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { isAdminRole } from "@/shared/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminUserItem } from "../types/user.types";
import { userService } from "../services/user.service";

interface UsersTableProps {
  users: AdminUserItem[];
  total: number;
}

function roleStyle() {
  return "bg-[#dfe9ff] text-[#2f66da]";
}

export function UsersTable({ users, total }: UsersTableProps) {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);
  const router = useRouter();

  const handleToggle = async (id: number) => {
    await userService.toggleUser(id);
    router.refresh();
  };

  return (
    <div className="overflow-hidden rounded-[16px] border border-[#e7edf5] bg-white shadow-[0_12px_35px_rgba(20,32,60,0.06)]">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-[#edf2f8] bg-[#fbfcfe] text-left text-[12px] uppercase tracking-[0.08em] text-[#7d8ca2]">
            <tr>
              <th className="px-5 py-4 font-semibold">Agent</th>
              <th className="px-5 py-4 font-semibold">Email</th>
              <th className="px-5 py-4 font-semibold">Type</th>
              <th className="px-5 py-4 font-semibold">Active Prospects</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              {isAdmin ? <th className="px-5 py-4 font-semibold">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[#edf2f8] last:border-b-0">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9eef8] text-sm font-semibold text-[#5f708c]">
                      {user.fullName
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <p className="font-semibold text-[#172033]">{user.fullName}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-[#61728b]">{user.email}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${roleStyle()}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-[#172033]">
                  {user.activeProspects}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex h-6 w-12 items-center rounded-full px-1 ${
                      user.active ? "bg-[#dfe9ff] justify-end" : "bg-[#edf2f7] justify-start"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full ${
                        user.active ? "bg-[#3d7cf4]" : "bg-white border border-[#d8e0ec]"
                      }`}
                    />
                  </span>
                </td>
                {isAdmin ? (
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4 text-[#7d8ca2]">
                      <Link href={`/agents/${user.id}/edit`} className="text-sm font-semibold">Edit</Link>
                      <button onClick={() => handleToggle(user.id)} className="text-sm font-semibold">
                        {user.active ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[#edf2f8] px-5 py-4 text-sm text-[#70819a]">
        <p>Showing 1 to {users.length} of {total} agents</p>
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e4eaf4] text-[#61728b]">
            1
          </button>
        </div>
      </div>
    </div>
  );
}
