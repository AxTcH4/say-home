"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";
import { chatbotService } from "../services/chatbotService";
import { cn } from "@/shared/lib/utils";

export interface Message {
  content: string;
  sender?: "PROSPECT" | "BOT";
  timestamp: Date;
  isError?: boolean;
}

interface SessionMessage {
  content: string;
  sender: "PROSPECT" | "BOT";
  createdAt: string;
}

interface ActiveSession {
  id: number;
  messages: SessionMessage[];
}

interface ActiveSessionResponse {
  data?: ActiveSession;
}

interface SendMessageResponse {
  data: {
    data: {
      session: {
        id: number;
      };
    };
  };
}

const CHAT_OPENED_KEY = "say_home_chat_opened_once";

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stompClient = useRef<Client | null>(null);
  const isOpenRef = useRef(false);

  function connectWebSocket(sessionId: number) {
    if (stompClient.current?.active) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        client.subscribe(`/topic/session/${sessionId}`, (message) => {
          const raw = JSON.parse(message.body) as SessionMessage;
          const botMessage: Message = {
            content: raw.content,
            sender: "BOT",
            timestamp: new Date(raw.createdAt),
          };

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          setIsBotTyping(false);
          setMessages((prev) => [...prev, botMessage]);

          if (!isOpenRef.current) {
            setUnreadCount((current) => current + 1);
            toast.success(raw.content, {
              duration: 3500,
              position: "bottom-right",
            });
          }
        });
      },
    });

    client.activate();
    stompClient.current = client;
  }

  useEffect(() => {
    const loadSession = async () => {
      try {
        const result = (await chatbotService.getActiveSessions()) as ActiveSessionResponse;
        if (!result?.data) return;

        const session = result.data;
        const history = session.messages.map((message) => ({
          content: message.content,
          sender: message.sender,
          timestamp: new Date(message.createdAt),
        }));

        setMessages(history);

        const hasOpenedChat =
          window.localStorage.getItem(CHAT_OPENED_KEY) === "true";
        const unseenMessages = history.filter(
          (message) => message.sender === "BOT",
        ).length;

        if (!hasOpenedChat && unseenMessages > 0) {
          setUnreadCount(unseenMessages);
        }

        connectWebSocket(session.id);
      } catch (error) {
        console.error("Unable to load chatbot session", error);
      }
    };

    loadSession();

    return () => {
      stompClient.current?.deactivate();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      inputRef.current?.focus();
      window.localStorage.setItem(CHAT_OPENED_KEY, "true");
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      content: inputValue.trim(),
      sender: "PROSPECT",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const messageContent = inputValue.trim();
    setInputValue("");
    setIsBotTyping(true);

    timeoutRef.current = setTimeout(() => {
      setIsBotTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          content: "Le serveur met trop de temps a repondre.",
          sender: "BOT",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    }, 25000);

    try {
      const res = (await chatbotService.sendMessage({
        ...userMessage,
        content: messageContent,
      })) as SendMessageResponse;

      const id = res.data.data.session.id;
      if (!stompClient.current?.active) {
        connectWebSocket(id);

        setTimeout(async () => {
          const latest =
            (await chatbotService.getActiveSessions()) as ActiveSessionResponse;
          if (latest.data) {
            const latestMessages = latest.data.messages.map((message) => ({
              content: message.content,
              sender: message.sender,
              timestamp: new Date(message.createdAt),
            }));

            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              setIsBotTyping(false);
              setMessages(latestMessages);
            }
          }
        }, 1000);
      }
    } catch {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsBotTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          content: "Une erreur est survenue.",
          sender: "BOT",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end ">
      <div
        className={cn(
          `mb-4 flex ${
            messages.length > 0 ? "h-[450px]" : ""
          } w-[470px] flex-col overflow-hidden rounded-[2px] bg-white shadow-2xl transition-all duration-300 ease-out`,
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0",
        )}
      >
        <div className="flex items-center justify-between bg-amber-950 px-4 py-3">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                Nouvelle Conversation
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {messages.length === 0 && (
            <div className="py-5">
              <div className="flex h-15 w-15 items-center rounded-full bg-white/20 ">
                <MessageCircle className="h-11 w-11 text-black" />
              </div>
              <p className=" pt-2 text-base font-semibold text-black ">
                Comment puis-je vous aider ?
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 ">
            {messages.map((message, index) => (
              <div
                key={`${message.timestamp.toISOString()}-${index}`}
                className={cn(
                  "flex",
                  message.sender === "PROSPECT"
                    ? "justify-end"
                    : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-[2px] px-4 py-2.5 text-[14px]",
                    message.sender === "PROSPECT"
                      ? "rounded bg-amber-950 text-white"
                      : "rounded bg-white text-gray-800 shadow-sm",
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      message.sender === "PROSPECT"
                        ? "text-blue-200"
                        : "text-gray-400",
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isBotTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1 py-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-gray-100 bg-white p-4">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-taupe-950 text-white transition-all hover:bg-amber-950 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() =>
          setIsOpen((current) => {
            const next = !current;
            if (next) {
              setUnreadCount(0);
            }
            return next;
          })
        }
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full bg-taupe-950 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-amber-950 hover:shadow-xl active:scale-95",
          isOpen && "rotate-90",
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {!isOpen && unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#e24b4b] px-1 text-[11px] font-semibold text-white shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
