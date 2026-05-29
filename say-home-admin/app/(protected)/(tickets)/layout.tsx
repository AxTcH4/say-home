"use client";

import { usePathname, useRouter } from "next/navigation";

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = pathname === "/chats" ? "sessions" : "tickets";

  return (
    <div className="flex h-full flex-col px-4">
      <div className="flex gap-6 border-b border-gray-200">
        <button
          onClick={() => router.push("/tickets")}
          className={`pb-3 text-sm font-semibold transition-colors ${
            activeTab === "tickets"
              ? "border-b-2 border-[#2f1b10] text-[#2f1b10]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Tickets
        </button>
        <button
          onClick={() => router.push("/chats")}
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
