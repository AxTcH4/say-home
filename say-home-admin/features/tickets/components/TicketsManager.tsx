"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ticketService } from "../services/ticketService";
import type { TicketItem } from "../types/ticket.types";
import type { ProspectListItem } from "@/features/prospects/types/prospect.types";

export function TicketsManager({
  tickets,
  prospects,
}: {
  tickets: TicketItem[];
  prospects: ProspectListItem[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prospectId, setProspectId] = useState<number>(prospects[0]?.id ?? 0);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await ticketService.createTicket({ title, description, prospectId });
    router.refresh();
  };

  const handleStatus = async (id: number, status: string) => {
    await ticketService.updateStatus(id, status);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="rounded-[18px] border border-[#e7edf5] bg-white p-6 shadow-[0_12px_35px_rgba(20,32,60,0.06)]">
        <div className="grid gap-4 md:grid-cols-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ticket title" className="h-12 rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none" required />
          <select value={prospectId} onChange={(e) => setProspectId(Number(e.target.value))} className="h-12 rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none">
            {prospects.map((prospect) => <option key={prospect.id} value={prospect.id}>{prospect.fullName}</option>)}
          </select>
          <button className="rounded-[10px] bg-[#2c1a0e] px-5 py-3 text-sm font-semibold text-white">Create Ticket</button>
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={4} className="mt-4 w-full rounded-[12px] border border-[#e4eaf4] px-4 py-3 text-sm outline-none" />
      </form>

      <div className="overflow-hidden rounded-[16px] border border-[#e7edf5] bg-white shadow-[0_12px_35px_rgba(20,32,60,0.06)]">
        <table className="min-w-full">
          <thead className="border-b border-[#edf2f8] bg-[#fbfcfe] text-left text-[12px] uppercase tracking-[0.08em] text-[#7d8ca2]">
            <tr>
              <th className="px-5 py-4">Title</th>
              <th className="px-5 py-4">Prospect</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-[#edf2f8] last:border-b-0">
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#172033]">{ticket.title}</p>
                  <p className="text-sm text-[#61728b]">{ticket.description}</p>
                </td>
                <td className="px-5 py-4 text-sm text-[#172033]">{ticket.prospectName}</td>
                <td className="px-5 py-4 text-sm text-[#172033]">{ticket.status}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-3 text-sm font-semibold text-[#172033]">
                    <button onClick={() => handleStatus(ticket.id, "IN_PROGRESS")}>In Progress</button>
                    <button onClick={() => handleStatus(ticket.id, "CLOSED")}>Close</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
