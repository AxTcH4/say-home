"use client";

import Image from "next/image";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmationModal from "@/shared/components/ConfirmationModal";
import TicketModal from "@/features/tickets/components/TicketModal";
import ProspectModal from "@/features/tickets/components/ProspectModal";
import { ticketService } from "@/features/tickets/services/ticketService";
import { calculateTimeAgo } from "@/shared/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { isAdminRole } from "@/shared/lib/auth";

const statusColors: Record<string, string> = {
  CLOSED: "bg-green-100 text-green-700",
  OPEN: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
};

const priorityColors: Record<string, string> = {
  HIGH: "font-semibold text-red-500",
  MEDIUM: "font-semibold text-orange-400",
  LOW: "font-semibold text-gray-400",
};

type TicketProspect = {
  firstName: string;
  lastName: string;
  email: string;
};

export type Ticket = {
  id: number;
  subject: string;
  description: string;
  prospect: TicketProspect;
  status: string;
  priority: string;
  lastUpdated: string;
};

interface RawTicketItem {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  updatedAt: string;
  prospect: {
    user: TicketProspect;
  };
}

interface TicketsResponse {
  data?: RawTicketItem[];
}

export default function Tickets() {
  const { user, isLoading } = useAuth();
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [prospectModal, setProspectModal] = useState<TicketProspect | null>(null);
  const [isTicketClosing, setIsTicketClosing] = useState(false);
  const [isProspectClosing, setIsProspectClosing] = useState(false);
  const [isConfirmationClosing, setIsConfirmationClosing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [isHoveredId, setIsHoveredId] = useState<number | null>(null);
  const [openPanelId, setOpenPanelId] = useState<number | null>(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<number | null>(
    null,
  );

  const fetchAllTickets = useCallback(async () => {
    try {
      const response = (await ticketService.getAllTickets()) as TicketsResponse;
      const data = response.data ?? [];

      if (data.length === 0) {
        setTickets([]);
        setAllTickets([]);
        return;
      }

      const mapped = data.map(
        (ticket): Ticket => ({
          id: ticket.id,
          subject: ticket.title,
          description: ticket.description,
          prospect: {
            firstName: ticket.prospect.user.firstName,
            lastName: ticket.prospect.user.lastName,
            email: ticket.prospect.user.email,
          },
          status: ticket.status,
          priority: ticket.priority,
          lastUpdated: calculateTimeAgo(ticket.updatedAt),
        }),
      );

      setTickets(mapped);
      setAllTickets(mapped);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Unable to load tickets");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchAllTickets();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchAllTickets]);

  const openModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority);
  };

  const closeModal = () => {
    setIsTicketClosing(true);
    setTimeout(() => {
      setSelectedTicket(null);
      setIsTicketClosing(false);
    }, 200);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationClosing(true);
    setTimeout(() => {
      setConfirmationModalOpen(null);
      setIsConfirmationClosing(false);
    }, 200);
  };

  const closeProspectModal = () => {
    setIsProspectClosing(true);
    setTimeout(() => {
      setProspectModal(null);
      setIsProspectClosing(false);
    }, 200);
  };

  const handleSave = async () => {
    if (!selectedTicket) {
      return;
    }

    try {
      const ticket = {
        id: selectedTicket.id,
        title: selectedTicket.subject,
        description: selectedTicket.description,
        prospect: selectedTicket.prospect,
        status: editStatus,
        priority: editPriority,
      };

      await ticketService.updateTicket(ticket.id, ticket);
      await fetchAllTickets();
      toast.success("Ticket updated successfully");
    } catch (error) {
      console.error("error", error);
      toast.error("Unable to update ticket");
    }

    closeModal();
  };

  const handleDelete = async (id: number) => {
    try {
      await ticketService.deleteTicket(id);
      await fetchAllTickets();
      toast.success("Ticket deleted successfully");
    } catch (error) {
      console.error("error", error);
      toast.error("Unable to delete ticket");
    }
  };

  const handleFilter = (event: ChangeEvent<HTMLSelectElement>) => {
    const filter = event.target.value.trim().toUpperCase().replace(/\s/g, "_");

    if (filter === "ALL") {
      setTickets(allTickets);
      return;
    }

    setTickets(allTickets.filter((ticket) => ticket.status === filter));
  };

  if (!isLoading && !isAdminRole(user?.role)) {
    return (
      <main className="flex-1 overflow-auto p-8">
        <div className="rounded-[18px] border border-[#e7edf5] bg-white px-6 py-8 shadow-[0_12px_35px_rgba(20,32,60,0.06)]">
          <p className="text-sm text-[#70819a]">
            This section is reserved for administrators.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto p-8">
      <div className="flex items-center justify-between">
        <h1 className="mb-4 text-2xl font-semibold">Tickets</h1>
        <div className="flex flex-row gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
            />
          </svg>

          <span>Filter By:</span>
          <select onChange={handleFilter} className="border-none" name="filters">
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="in_progress">In Progress</option>
          </select>
        </div>
      </div>

      <div className="rounded-[2px] border border-gray-100 bg-white">
        {tickets.length === 0 ? (
          <div className="flex h-96 items-center justify-center">
            <p className="text-gray-400">No tickets found</p>
          </div>
        ) : (
          <table className="z-0 w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Subject
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Raised By
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => openModal(ticket)}
                  className="group cursor-pointer transition hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-semibold text-[#2f1b10]">
                    {ticket.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {ticket.subject}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    <button
                      className="transition hover:text-[#2c1a0e]"
                      onClick={(event) => {
                        event.stopPropagation();
                        setProspectModal(ticket.prospect);
                      }}
                    >
                      {ticket.prospect.firstName} {ticket.prospect.lastName}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[ticket.status]}`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${priorityColors[ticket.priority]}`}>
                    {ticket.priority}
                  </td>
                  <td className="group flex flex-row items-center justify-between px-6 py-4 text-gray-400">
                    <span>Il y a {ticket.lastUpdated}</span>
                    <div className="relative">
                      <svg
                        onMouseEnter={() => setIsHoveredId(ticket.id)}
                        onMouseLeave={() => setIsHoveredId(null)}
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenPanelId((current) =>
                            current === ticket.id ? null : ticket.id,
                          );
                        }}
                        className="invisible h-4 w-4 group-hover:visible"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="4" cy="12" r="3" fill="currentColor">
                          {isHoveredId === ticket.id && (
                            <animate
                              attributeName="cy"
                              calcMode="spline"
                              dur="0.6s"
                              keySplines=".33,.66,.66,1;.33,0,.66,.33"
                              values="12;6;12"
                              repeatCount="indefinite"
                            />
                          )}
                        </circle>
                        <circle cx="12" cy="12" r="3" fill="currentColor">
                          {isHoveredId === ticket.id && (
                            <animate
                              attributeName="cy"
                              calcMode="spline"
                              dur="0.6s"
                              begin="0.1s"
                              keySplines=".33,.66,.66,1;.33,0,.66,.33"
                              values="12;6;12"
                              repeatCount="indefinite"
                            />
                          )}
                        </circle>
                        <circle cx="20" cy="12" r="3" fill="currentColor">
                          {isHoveredId === ticket.id && (
                            <animate
                              attributeName="cy"
                              calcMode="spline"
                              dur="0.6s"
                              begin="0.2s"
                              keySplines=".33,.66,.66,1;.33,0,.66,.33"
                              values="12;6;12"
                              repeatCount="indefinite"
                            />
                          )}
                        </circle>
                      </svg>
                      {openPanelId === ticket.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenPanelId(null);
                            }}
                          />
                          <div className="absolute right-0 top-6 z-50 w-36 rounded border border-gray-100 bg-white shadow-md">
                            <div
                              className="flex cursor-pointer flex-row items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                              onClick={(event) => {
                                event.stopPropagation();
                                setConfirmationModalOpen(ticket.id);
                                setOpenPanelId(null);
                              }}
                            >
                              <Image
                                src="/delete.png"
                                width={16}
                                height={16}
                                className="h-4 w-4"
                                alt=""
                              />
                              <span>Delete</span>
                            </div>
                          </div>
                        </>
                      )}
                      {confirmationModalOpen === ticket.id && (
                        <ConfirmationModal
                          selectedItem={ticket}
                          onClose={closeConfirmationModal}
                          isClosing={isConfirmationClosing}
                          onConfirm={() => {
                            void handleDelete(ticket.id);
                            setConfirmationModalOpen(null);
                          }}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {prospectModal && (
        <ProspectModal
          prospect={prospectModal}
          onClose={closeProspectModal}
          isClosing={isProspectClosing}
        />
      )}

      {selectedTicket && (
        <TicketModal
          selectedTicket={selectedTicket}
          onClose={closeModal}
          onConfirm={handleSave}
          isClosing={isTicketClosing}
          editStatus={editStatus}
          setEditStatus={setEditStatus}
          editPriority={editPriority}
          setEditPriority={setEditPriority}
        />
      )}
    </main>
  );
}
