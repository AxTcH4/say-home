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
}

const CHAT_OPENED_KEY = "say_home_chat_opened_once";

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Bonjour ! Comment puis-je vous aider ?",
      sender: "BOT",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stompClient = useRef<Client | null>(null);
  const isOpenRef = useRef(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const result = await chatbotService.getActiveSessions();
        if (!result?.data) return;

        const session = result.data;
        setActiveSessionId(session.id);

        const history = session.messages.map((message: any) => ({
          content: message.content,
          sender: message.sender,
          timestamp: new Date(message.createdAt),
        }));

        setMessages((prev) => [prev[0], ...history]);

        const hasOpenedChat = window.localStorage.getItem(CHAT_OPENED_KEY) === "true";
        const unseenMessages = history.filter((message: Message) => message.sender === "BOT").length;
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
      setUnreadCount(0);
      window.localStorage.setItem(CHAT_OPENED_KEY, "true");
    }
  }, [isOpen]);

  const connectWebSocket = (sessionId: number) => {
    if (stompClient.current?.active) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        client.subscribe(`/topic/session/${sessionId}`, (message) => {
          const raw = JSON.parse(message.body);
          const botMessage: Message = {
            content: raw.content,
            sender: "BOT",
            timestamp: new Date(raw.createdAt ?? Date.now()),
          };

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
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      content: inputValue.trim(),
      sender: "PROSPECT",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    const res = await chatbotService.sendMessage(userMessage);
    const id = res.data.data.session.id;
    setActiveSessionId(id);

    if (!stompClient.current?.active) {
      connectWebSocket(id);

      setTimeout(async () => {
        const latest = await chatbotService.getActiveSessions();
        if (latest.data) {
          const latestMessages = latest.data.messages.map((message: any) => ({
            content: message.content,
            sender: message.sender,
            timestamp: new Date(message.createdAt),
          }));
          setMessages((prev) => [prev[0], ...latestMessages]);
        }
      }, 2000);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <div
        className={cn(
          "mb-4 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-[2px] bg-white shadow-2xl transition-all duration-300 ease-out",
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        )}
      >
        <div className="flex items-center justify-between bg-amber-950 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">SAY Assistant</h3>
              <p className="text-xs text-blue-100">En ligne</p>
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
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => (
              <div
                key={`${message.timestamp.toISOString()}-${index}`}
                className={cn(
                  "flex",
                  message.sender === "PROSPECT" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-[2px] px-4 py-2.5 text-sm",
                    message.sender === "PROSPECT"
                      ? "rounded-br-md bg-amber-950 text-white"
                      : "rounded-bl-md bg-white text-gray-800 shadow-sm"
                  )}
                >
                  <p>{message.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      message.sender === "PROSPECT" ? "text-blue-200" : "text-gray-400"
                    )}
                  >
                    {new Date(message.timestamp ?? Date.now()).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
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
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full bg-taupe-950 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-amber-950 hover:shadow-xl active:scale-95",
          isOpen && "rotate-90"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {!isOpen && unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#e24b4b] px-1 text-[11px] font-semibold text-white shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
