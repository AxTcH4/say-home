"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<"tickets" | "sessions">("tickets");
  const isFirstRender = useRef(true);
  const router = useRouter();
    useEffect(() => {
    if (isFirstRender.current) {
        // isFirstRender.current = false;
        // return;
    }
    if (activeTab === "sessions") router.push("/chats");
    else router.push("/tickets");
    }, [activeTab]);

  return (
    <div className="px-4 h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 ">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`pb-3 text-sm font-semibold transition-colors ${
            activeTab === "tickets"
              ? "border-b-2 border-[#2f1b10] text-[#2f1b10]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Tickets
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`pb-3 text-sm font-semibold transition-colors ${
            activeTab === "sessions"
              ? "border-b-2 border-[#2f1b10] text-[#2f1b10]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Chat Sessions
        </button>
      </div>
      {children}
    </div>
  );
}
