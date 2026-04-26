"use client";
import { useEffect, useState } from "react";
import SideBar from "@/shared/components/SideBar";
import TopBar from "@/shared/components/TopBar";
import { X } from "lucide-react";
import { ticketService } from "@/features/tickets/services/ticketService";
import { stat } from "fs";
import ConfirmationModal from "@/shared/components/ConfirmationModal";
import { Span } from "next/dist/trace";
import { toast} from "sonner";
import { calculateTimeAgo } from "@/shared/lib/utils";
type Message = {
  sender: "BOT" | "PROSPECT";
  content: string;
  time: string;
};

const mockSessions = [
  {
    id: "#TK-1082",
    subject: "Wants to visit Loft Marais",
    status: "Active",
    lastMessage: "Yes, please book it.",
    time: "10:48 AM",
    prospect: {
      firstName: "Alice",
      lastName: "Smith",
      email: "9H2a2@example.com",
    },
    messages: [
      {
        sender: "bot",
        text: "Hello Alice! I see you're interested in the Loft Marais property. How can I help you today?",
        time: "10:45 AM",
      },
      {
        sender: "user",
        text: "I saw the loft in Marais, it looks amazing! Can I schedule a visit this Saturday afternoon around 2 PM?",
        time: "10:46 AM",
      },
      {
        sender: "bot",
        text: "Excellent choice! Checking the availability for Saturday at 2 PM... One moment please.",
        time: "10:46 AM",
      },
      {
        sender: "bot",
        text: "Saturday at 2 PM is available! Would you like me to book this for you? I'll just need to confirm your phone number.",
        time: "10:47 AM",
      },
      {
        sender: "user",
        text: "Yes, please book it. My number is +33 6 12 34 56 78. Also, is there an elevator in the building?",
        time: "10:48 AM",
      },
    ],
  },
  {
    id: "#TK-1075",
    subject: "Pricing Inquiry: Bastille",
    status: "Resolved",
    lastMessage: "Thank you for the info.",
    time: "9:30 AM",
    prospect: {
      firstName: "John",
      lastName: "Doe",
      email: "9H2a2@example.com",
    },
    messages: [
      {
        sender: "bot",
        text: "Hello! How can I help you today?",
        time: "9:28 AM",
      },
      {
        sender: "user",
        text: "What is the price for the Bastille apartment?",
        time: "9:29 AM",
      },
      {
        sender: "bot",
        text: "The Bastille apartment is listed at €450,000. Would you like to schedule a visit?",
        time: "9:30 AM",
      },
      { sender: "user", text: "Thank you for the info.", time: "9:30 AM" },
    ],
  },
];

export default function ChatSessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [openPanelId, setOpenPanelId] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  
  useEffect(() => {
    if (showConfirmationModal || !showConfirmationModal) {
      setIsChatOpen(false);
    }
  }, [showConfirmationModal]);

  const handleDelete = async (id: number) => {
    try {
      await ticketService.deleteChatSession(id);
      fetchChatSessions();
      toast.success("Ticket deleted successfully");

    } catch (e) {
      console.log("error", e);
    }
  };

  const fetchChatSessions = async () => {
    try {
      const data = await ticketService.getAllChatSessions();
      //handle errors & bad results

      if (data.data.length > 0) {
        // return data;
        setSessions(
          data.data.map((s: any) => ({
            id: s.id,
            subject: `Chat number ${s.id}`,
            status: s.ongoing === true ? "Active" : "Resolved",
            lastMessage: s.messages[s.messages.length - 1].content,
            time: calculateTimeAgo(s.createdAt),
            prospect: {
              firstName: s.prospect.user.firstName,
              lastName: s.prospect.user.lastName,
              email: s.prospect.email,
            },
            messages: [
              ...s.messages.map((m: any) => ({
                sender: m.sender,
                content: m.content,
                time: calculateTimeAgo(m.createdAt),
              })),
            ],
          })),
        );
      } else {
        setSessions([]);
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    fetchChatSessions();
  }, []);

  return (
    <main className="flex-1 overflow-hidden p-8 flex flex-col">
      <h1 className="text-2xl font-semibold mb-4">Chat Sessions</h1>
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Sessions list */}
        <div className="w-[100%] bg-white rounded-[2px] overflow-y-auto h-full">
          {sessions.length === 0 ? (
            <div className="text-gray-400 text-center py-4">
              No chat sessions found
            </div>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => {
                      setSelectedSession(session);
                      console.log(session.messages);
                      setIsChatOpen(true);
                    }}
                    className={`group cursor-pointer transition ${
                      selectedSession?.id === session.id
                        ? "bg-[#f5ede8]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* <td className="px-6 py-4 text-[#2f1b10] font-semibold">{session.id}</td> */}
                    <td className=" px-6 py-4 text-black-700 text-[15px] flex flex-row justify-between border-b border-gray-100">
                      <div>
                        <div className="font-semibold mb-1">
                          {session.subject}
                        </div>
                        <div className="text-xs text-gray-400">
                          Deriner message à{" "}
                          <span className="font-semibold">{session.time}</span>{" "}
                          par{" "}
                          <span className="font-semibold">
                            {session.prospect.firstName}{" "}
                            {session.prospect.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <svg
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenPanelId(
                              openPanelId === session.id ? null : session.id,
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
                        {openPanelId === session.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenPanelId(null);
                              }}
                            />
                            <div className="absolute right-0 top-6 z-50 bg-white border border-gray-100 rounded shadow-md w-36">
                              <div
                                onClick={() => setShowConfirmationModal(true)}
                                className="px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer flex flex-row gap-2 items-center"
                              >
                                <img
                                  src="/delete.png"
                                  className="w-4 h-4"
                                  alt=""
                                />
                                <span>Delete</span>
                              </div>
                            </div>

                            {showConfirmationModal && (
                              <ConfirmationModal
                                selectedSession={session}
                                onClose={() => setShowConfirmationModal(false)}
                                onConfirm={() => {
                                  handleDelete(session.id);
                                  setShowConfirmationModal(false);
                                }}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {isChatOpen && (
          <div className="  w-[45%] bg-white rounded-[2px] shadow-sm border border-gray-100 flex flex-col overflow-hidden ">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start shrink-0">
              <div>
                <h2 className="font-semibold text-gray-800">
                  {selectedSession?.subject}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {selectedSession?.id}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      selectedSession?.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {selectedSession.status === "Active"
                      ? "● ACTIVE CONVERSATION"
                      : "● RESOLVED"}
                  </span>
                </div>
              </div>
              <X
                onClick={() => {
                  setIsChatOpen(false);
                  setSelectedSession(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {selectedSession != null ? (
                selectedSession.messages.map((msg: Message, i: number) => (
                  <div
                    key={i}
                    className={`flex items-start gap-1 max-w-[47%] ${
                      msg.sender === "PROSPECT"
                        ? "ml-auto flex-row-reverse"
                        : ""
                    }`}
                  >
                    {msg.sender === "BOT" && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-2 mt-1 shrink-0 text-[10px]">
                        SAY
                      </div>
                    )}
                    <div className={`max-w-[70%]`}>
                      <div
                        className={`px-4 py-3 w-fit rounded-2xl text-sm ${
                          msg.sender === "PROSPECT"
                            ? "bg-[#2f1b10] text-white rounded-tr-sm"
                            : "bg-gray-100 text-gray-800 rounded-tl-sm"
                        }`}
                      >
                        {msg.content.trim()}
                      </div>
                      <p
                        className={`text-[10px] flex flex-col text-gray-400 mt-1 ${msg.sender === "PROSPECT" ? "text-right" : ""}`}
                      >
                        {msg.sender === "BOT"
                          ? 
                          <span>
                              SAY Assistant  
                          </span> 
                          : 
                          <span>
                              Prospect  
                          </span>
                          }

                        <span>il y a {msg.time}</span> 
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div>No Messages in this session</div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
