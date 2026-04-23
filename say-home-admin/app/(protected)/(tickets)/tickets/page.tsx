"use client";
import { useState } from "react";

const mockTickets = [
  { id: "#TK-1082", subject: "Wants to visit Loft Marais", status: "AI Managed", priority: "High", lastUpdated: "2 mins ago" },
  { id: "#TK-1075", subject: "Pricing Inquiry: Bastille", status: "Resolved", priority: "Medium", lastUpdated: "1 hour ago" },
  { id: "#TK-1068", subject: "Request for virtual tour", status: "Pending", priority: "Low", lastUpdated: "3 hours ago" },
  { id: "#TK-1061", subject: "Complaint about agent response time", status: "In Progress", priority: "High", lastUpdated: "5 hours ago" },
];

const statusColors: Record<string, string> = {
  "AI Managed": "bg-blue-100 text-blue-700",
  "Resolved": "bg-green-100 text-green-700",
  "Pending": "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-orange-100 text-orange-700",
};

const priorityColors: Record<string, string> = {
  "High": "text-red-500 font-semibold",
  "Medium": "text-orange-400 font-semibold",
  "Low": "text-gray-400 font-semibold",
};

type Ticket = typeof mockTickets[0];

export default function Tickets() {
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
    const [isHovered, setIsHovered] = useState(false);
  const [openPanelId, setOpenPanelId] = useState<string | null>(null);

  const openModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority);
  };

  const closeModal = () => setSelectedTicket(null);

  const handleSave = () => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket!.id
          ? { ...t, status: editStatus, priority: editPriority }
          : t
      )
    );
    closeModal();
  };

  return (
    <main className="flex-1 overflow-auto p-8">
      <h1 className="text-2xl font-semibold mb-4">Tickets</h1>

      {/* Table */}
      <div className="bg-white rounded-[2px] border border-gray-100 ">
        <table className="z-0 w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Subject</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tickets.map((ticket) => (
              <tr key={ticket.id} onClick={() => openModal(ticket)} className="group hover:bg-gray-50 transition cursor-pointer">
                <td className="px-6 py-4 text-[#2f1b10] font-semibold">{ticket.id}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">{ticket.subject}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className={`px-6 py-4 text-sm ${priorityColors[ticket.priority]}`}>{ticket.priority}</td>
                <td className="px-6 py-4 text-gray-400 flex justify-between">{ticket.lastUpdated}

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
                        className="hidden group-hover:block w-4 h-4"
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
                            <div className="px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer flex flex-row gap-2 items-center">
                              <img src="/delete.png" className="w-4 h-4" alt="" />
                              <span>Delete</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-[2px] shadow-xl w-[420px] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-semibold text-gray-800 text-base">{selectedTicket.subject}</h2>
                <span className="text-xs text-gray-400">{selectedTicket.id}</span>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-[2px] px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#2f1b10]"
                >
                  <option>AI Managed</option>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full border border-gray-200 rounded-[2px] px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#2f1b10]"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className=" flex-1 border border-gray-200 rounded-[2px] py-2 text-sm text-gray-500 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 bg-[#2f1b10] text-white rounded-[2px] py-2 text-sm font-semibold hover:bg-[#1f1208] transition">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}