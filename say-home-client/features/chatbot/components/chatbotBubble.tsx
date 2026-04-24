"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { send } from "process";
import { chatbotService } from "../services/chatbotService";
import { cn } from "@/shared/lib/utils";

export interface Message {
  // id: string
  content: string;
  sender?: "PROSPECT" | "BOT";
  timestamp: Date;
}

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      // id: "1",
      content: "Bonjour ! Comment puis-je vous aider ?",
      sender: "BOT",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const loadSession = async () => {
      const result = await chatbotService.getActiveSessions();
      console.log("session result:", result.data);

      if (result?.data) {
        const session = result.data; // ← get first session from array
        setActiveSessionId(session.id);

        // map messages to your Message interface
        const history = session.messages.map((m: any) => ({
          content: m.content,
          sender: m.sender,
          timestamp: new Date(m.createdAt),
        }));

        setMessages((prev) => [
          prev[0], // keep initial BOT greeting
          ...history, // append history
        ]);

        connectWebSocket(session.id);
      }
    };
    loadSession();

    return () => {
      stompClient.current?.deactivate();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  //websocket config

  const connectWebSocket = (sessionId: number) => {
    // don't create a new connection if already active
    if (stompClient.current?.active) {
      console.log("already connected, skipping");
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        console.log("WebSocket connected");
        client.subscribe(`/topic/session/${sessionId}`, (message) => {
          const raw = JSON.parse(message.body);
          const botMessage: Message = {
            content: raw.content,
            sender: "BOT",
            timestamp: new Date(raw.createdAt ?? Date.now()),
          };
          setMessages((prev) => [...prev, botMessage]);
        });
      },
    });
    client.activate();
    stompClient.current = client;
  };
  const stompClient = useRef<Client | null>(null);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stompClient.current?.deactivate();
    };
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      content: inputValue.trim(),
      sender: "PROSPECT",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    console.log("1 - sending message...");
    await chatbotService.sendMessage(userMessage);
    console.log("2 - message sent");

    if (!stompClient.current?.active) {
      // wait for bot reply then fetch again
      setTimeout(async () => {
        const latest = await chatbotService.getActiveSessions();
        if (latest?.data && latest.data.length > 0) {
          const latestMessages = latest.data[0].messages.map((m: any) => ({
            content: m.content,
            sender: m.sender,
            timestamp: new Date(m.createdAt),
          }));
          setMessages((prev) => [prev[0], ...latestMessages]);
        }
      }, 1500); // 2s — after bot reply is saved
    } else {
      console.log("3 - websocket already active, skipping");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* fenetre generale */}
      <div
        className={cn(
          "mb-4 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-[2px] bg-white shadow-2xl transition-all duration-300 ease-out",

          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0",
        )}
      >
        {/* Header */}
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

        {/* Zones messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="flex flex-col gap-3">
            {messages.map((message, i: number) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  message.sender === "PROSPECT"
                    ? "justify-end"
                    : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-[2px] px-4 py-2.5 text-sm",
                    message.sender === "PROSPECT"
                      ? "rounded-br-md bg-amber-950 text-white"
                      : "rounded-bl-md bg-white text-gray-800 shadow-sm",
                  )}
                >
                  <p>{message.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      message.sender === "PROSPECT"
                        ? "text-blue-200"
                        : "text-gray-400",
                    )}
                  >
                    {new Date(
                      message.timestamp ?? Date.now(),
                    ).toLocaleTimeString([], {
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

        {/* Input  */}
        <div className="border-t border-gray-100 bg-white p-4">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
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

      {/* boutton sticky */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full bg-taupe-950 text-white shadow-lg transition-all duration-300 hover:bg-amber-950 hover:shadow-xl hover:scale-105 active:scale-95",
          isOpen && "rotate-90",
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
