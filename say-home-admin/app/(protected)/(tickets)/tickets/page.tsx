"use client";
import { ticketService } from "@/features/tickets/services/ticketService";
import { apiClient } from "@/shared/lib/axios";
import { useEffect, useState } from "react";
import ConfirmationModal from "@/shared/components/ConfirmationModal";
import TicketModal from "@/features/tickets/components/TicketModal";
import { toast } from "sonner";
import { title } from "process";
import { calculateTimeAgo } from "@/shared/lib/utils";
import ProspectModal from "@/features/tickets/components/ProspectModal";

const statusColors: Record<string, string> = {
  CLOSED: "bg-green-100 text-green-700",
  OPEN: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
};

const priorityColors: Record<string, string> = {
  HIGH: "text-red-500 font-semibold",
  MEDIUM: "text-orange-400 font-semibold",
  LOW: "text-gray-400 font-semibold",
};

export type Ticket = {
  id: number;
  subject: string;
  description: string;
  prospect: {
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  priority: string;
  lastUpdated: string;
};

export default function Tickets() {
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [prospectModal, setProspectModal] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [openPanelId, setOpenPanelId] = useState<string | null>(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<
    string | null
  >(null);

  const openModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    console.log("ticket set", ticket);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority);
  };

  const closeModal = () => setSelectedTicket(null);
  const getStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };
  const fetchAllTickets = async () => {
    try {
      const response = await ticketService.getAllTickets();
      const data = response.data;
      console.log(data);
      if (data && data.length > 0) {
        const mapped = data.map((ticket: any) => ({
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
        }));
        setTickets(mapped);
        setAllTickets(mapped);
      } else {
        setTickets([]);
        setAllTickets([]);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };
useEffect (() => {
  if (prospectModal) { 
    closeModal();
  }
})
  useEffect(() => {
    fetchAllTickets();
  }, []);
  const handleSave = async () => {
    try {
      const ticket = {
        id: selectedTicket!.id,
        title: selectedTicket!.subject,
        description: selectedTicket!.description,
        prospect: selectedTicket!.prospect,
        status: editStatus,
        priority: editPriority,
      };
      console.log("ticket abt to send", ticket);
      await ticketService.updateTicket(ticket.id, ticket);
      fetchAllTickets();
      toast.success("Ticket updated successfully");
    } catch (e) {
      console.log("error", e);
    }
    closeModal();
  };

  const handleDelete = async (id: number) => {
    try {
      await ticketService.deleteTicket(id);
      fetchAllTickets();
      toast.success("Ticket deleted successfully");
    } catch (e) {
      console.log("error", e);
    }
  };

  const handleFilter = (e:any) => {
    const filter = e.target.value;
    console.log("filter", filter);
    const usedFilter = filter.trim().toUpperCase().replace(/\s/g, "_");
    console.log("usedFilter", usedFilter);
    console.log("allTickets", allTickets);
    console.log("tickets", tickets);

    if (usedFilter === "ALL") {
      setTickets(allTickets);
    } else {
      setTickets(allTickets.filter((t) => t.status === usedFilter));
    }
  };

  return (
    <main className="flex-1 overflow-auto p-8">
      <div className="flex items-center justify-between ">
        <h1 className="text-2xl font-semibold mb-4">Tickets</h1>
        <div className="flex flex-row gap-2 ">
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

          <span>Filter By: </span>
          <select
            onChange={handleFilter}
            className=" border-none"
            name="filters"
            id=""
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="in_progress">In Progress</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2px] border border-gray-100 ">
        {tickets.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-400">No tickets found</p>
          </div>
        ) : (
          <table className="z-0 w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Subject
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Raised By
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => openModal(ticket)}
                  className="group hover:bg-gray-50 transition cursor-pointer"
                >
                  <td className="px-6 py-4 text-[#2f1b10] font-semibold">
                    {ticket.id}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {ticket.subject}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium ">
                    <div className=" hover:text-[#2c1a0e]" onClick={()=>setProspectModal(ticket.prospect)}>
                      {ticket.prospect.firstName} {ticket.prospect.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[ticket.status]}`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 text-sm ${priorityColors[ticket.priority]}`}
                  >
                    {ticket.priority}
                  </td>
                  <td className="group px-6 py-4 text-gray-400 flex flex-row  items-center justify-between">
                    <span>Il y a {ticket.lastUpdated}</span>
                    <div className="relative">
                      <svg
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenPanelId(
                            openPanelId === ticket.id ? null : ticket.id,
                          );
                        }}
                        className=" invisible group-hover:visible w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="4" cy="12" r="3" fill="currentColor">
                          {isHovered && (
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
                          {isHovered && (
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
                          {isHovered && (
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenPanelId(null);
                            }}
                          />
                          <div className="absolute z-10 right-0 top-6 z-50 bg-white border border-gray-100 rounded shadow-md w-36">
                            <div
                              className="px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer flex flex-row gap-2 items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmationModalOpen(ticket.id);
                                setOpenPanelId(null);
                              }}
                            >
                              <img
                                src="/delete.png"
                                className="w-4 h-4"
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
                          onClose={() => setConfirmationModalOpen(null)}
                          onConfirm={() => {
                            handleDelete(ticket.id);
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
      {
        prospectModal && (
          <ProspectModal
            prospect={prospectModal}
            onClose={() => setProspectModal(null)}
          />
        )
      }

      {/* Modal */}
      {selectedTicket && (
        <TicketModal
          selectedTicket={selectedTicket}
          onClose={closeModal}
          onConfirm={handleSave}
          editStatus={editStatus}
          setEditStatus={setEditStatus}
          editPriority={editPriority}
          setEditPriority={setEditPriority}
        />
      )}
    </main>
  );
}
