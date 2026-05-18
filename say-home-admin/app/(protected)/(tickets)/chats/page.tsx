"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import ConfirmationModal from "@/shared/components/ConfirmationModal";
import { ticketService } from "@/features/tickets/services/ticketService";
import { calculateTimeAgo } from "@/shared/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { isAdminRole } from "@/shared/lib/auth";

type Message = {
  sender: "BOT" | "PROSPECT";
  content: string;
  time: string;
};

interface ChatProspect {
  firstName: string;
  lastName: string;
  email: string;
}

interface ChatSessionItem {
  id: number;
  subject: string;
  status: "Active" | "Resolved";
  lastMessage: string;
  time: string;
  prospect: ChatProspect;
  messages: Message[];
}

interface RawChatMessage {
  sender: "BOT" | "PROSPECT";
  content: string;
  createdAt: string;
}

interface RawChatSession {
  id: number;
  ongoing: boolean;
  createdAt: string;
  messages: RawChatMessage[];
  prospect: {
    user: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
}

interface ChatSessionsResponse {
  data?: RawChatSession[];
}

export default function ChatSessions() {
  const { user, isLoading } = useAuth();
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSessionItem | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHoveredId, setIsHoveredId] = useState<number | null>(null);
  const [openPanelId, setOpenPanelId] = useState<number | null>(null);
  const [confirmationSessionId, setConfirmationSessionId] = useState<number | null>(null);

  const closeChat = () => {
    setIsChatOpen(false);
    setSelectedSession(null);
  };

  const fetchChatSessions = useCallback(async () => {
    try {
      const result = (await ticketService.getAllChatSessions()) as ChatSessionsResponse;
      const data = result.data ?? [];

      if (data.length === 0) {
        setSessions([]);
        return;
      }

      setSessions(
        data.map((session) => ({
          id: session.id,
          subject: `Chat number ${session.id}`,
          status: session.ongoing ? "Active" : "Resolved",
          lastMessage:
            session.messages[session.messages.length - 1]?.content ?? "No messages",
          time: calculateTimeAgo(session.createdAt),
          prospect: {
            firstName: session.prospect.user.firstName,
            lastName: session.prospect.user.lastName,
            email: session.prospect.email,
          },
          messages: session.messages.map((message) => ({
            sender: message.sender,
            content: message.content,
            time: calculateTimeAgo(message.createdAt),
          })),
        })),
      );
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      toast.error("Unable to load chat sessions");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchChatSessions();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchChatSessions]);

  const handleDelete = async (id: number) => {
    try {
      await ticketService.deleteChatSession(id);
      await fetchChatSessions();
      if (selectedSession?.id === id) {
        closeChat();
      }
      toast.success("Chat session deleted successfully");
    } catch (error) {
      console.error("Error deleting chat session:", error);
      toast.error("Unable to delete chat session");
    } finally {
      setConfirmationSessionId(null);
    }
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
    <main className="flex flex-1 flex-col overflow-hidden p-8">
      <h1 className="mb-4 text-2xl font-semibold">Chat Sessions</h1>
      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="h-full w-full overflow-y-auto rounded-[2px] bg-white">
          {sessions.length === 0 ? (
            <div className="py-4 text-center text-gray-400">
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
                      setIsChatOpen(true);
                    }}
                    className={`group cursor-pointer transition ${
                      selectedSession?.id === session.id
                        ? "bg-[#f5ede8]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="border-b border-gray-100 px-6 py-4 text-[15px] text-black-700">
                      <div className="flex flex-row justify-between">
                        <div>
                          <div className="mb-1 font-semibold">{session.subject}</div>
                          <div className="text-xs text-gray-400">
                            Dernier message il y a{" "}
                            <span className="font-semibold">{session.time}</span> par{" "}
                            <span className="font-semibold">
                              {session.prospect.firstName} {session.prospect.lastName}
                            </span>
                          </div>
                        </div>
                        <div className="relative">
                          <svg
                            onMouseEnter={() => setIsHoveredId(session.id)}
                            onMouseLeave={() => setIsHoveredId(null)}
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenPanelId((current) =>
                                current === session.id ? null : session.id,
                              );
                            }}
                            className="hidden h-4 w-4 group-hover:block"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="4" cy="12" r="3" fill="currentColor">
                              {isHoveredId === session.id && (
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
                              {isHoveredId === session.id && (
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
                              {isHoveredId === session.id && (
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
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenPanelId(null);
                                }}
                              />
                              <div className="absolute right-0 top-6 z-50 w-36 rounded border border-gray-100 bg-white shadow-md">
                                <div
                                  onClick={() => {
                                    setConfirmationSessionId(session.id);
                                    setOpenPanelId(null);
                                  }}
                                  className="flex cursor-pointer flex-row items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
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
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {isChatOpen && selectedSession ? (
          <div className="w-[45%] overflow-hidden rounded-[2px] border border-gray-100 bg-white shadow-sm">
            <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="font-semibold text-gray-800">{selectedSession.subject}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-gray-400">{selectedSession.id}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      selectedSession.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {selectedSession.status === "Active"
                      ? "ACTIVE CONVERSATION"
                      : "RESOLVED"}
                  </span>
                </div>
              </div>
              <X
                onClick={closeChat}
                className="text-lg leading-none text-gray-400 hover:text-gray-600"
              />
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              {selectedSession.messages.length > 0 ? (
                selectedSession.messages.map((message, index) => (
                  <div
                    key={`${message.sender}-${index}`}
                    className={`flex max-w-[47%] items-start gap-1 ${
                      message.sender === "PROSPECT" ? "ml-auto flex-row-reverse" : ""
                    }`}
                  >
                    {message.sender === "BOT" && (
                      <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px]">
                        SAY
                      </div>
                    )}
                    <div className="max-w-[70%]">
                      <div
                        className={`w-fit rounded-2xl px-4 py-3 text-sm ${
                          message.sender === "PROSPECT"
                            ? "rounded-tr-sm bg-[#2f1b10] text-white"
                            : "rounded-tl-sm bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.content.trim()}
                      </div>
                      <p
                        className={`mt-1 flex flex-col text-[10px] text-gray-400 ${
                          message.sender === "PROSPECT" ? "text-right" : ""
                        }`}
                      >
                        <span>{message.sender === "BOT" ? "SAY Assistant" : "Prospect"}</span>
                        <span>il y a {message.time}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div>No messages in this session</div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {confirmationSessionId !== null ? (
        <ConfirmationModal
          onClose={() => setConfirmationSessionId(null)}
          isClosing={false}
          onConfirm={() => void handleDelete(confirmationSessionId)}
        />
      ) : null}
    </main>
  );
}
