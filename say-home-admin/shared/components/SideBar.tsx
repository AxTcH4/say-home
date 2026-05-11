"use client";
import Link from "next/link";
import { APP_ROUTES } from "@/shared/lib/routes";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";
  const initial = useMemo(() => {
    if (!user) return "";
    const first = user?.firstName?.trim().charAt(0) ?? "";
    const last = user?.lastName?.trim().charAt(0) ?? "";
    return `${first}${last}`.toUpperCase();
  }, [user]);

  return (
    <div
      className={`h-screen transition-all duration-200 ease-in-out ${expanded ? "w-[14%]" : "w-[60px]"} border border-black shadow-[0_5px_2px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between items-center text-black overflow-hidden`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => {
        setExpanded(false);
        setOpen(false);
      }}
    >
      <div className="w-full">
        <div className="flex items-center justify-center py-4 ">
          <img
            src="/logo-w-o-bg.png"
            alt="SAY HOME"
            className={`transition-all duration-200 ${expanded ? "w-19 h-19 me-2" : "w-12 h-12"}`}
          />
        </div>
        <div className="px-2">
          <div className={`group hover:shadow-sm transition px-3 py-3 mt-1 rounded-[2px] ${pathname === APP_ROUTES.HOME ? "bg-[#2f1b10] text-white shadow-sm" : ""}`}>
            <div className="flex flex-row gap-4 items-center justify-start">
              <img src="/dashboard.svg" alt="" className={`w-5 h-5 shrink-0 transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6 ${pathname === APP_ROUTES.HOME ? "invert" : ""}`} />
              <span className={`font-medium text-sm whitespace-nowrap transition-all duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                <Link href={APP_ROUTES.HOME}>Dashboard</Link>
              </span>
            </div>
          </div>
          {isAdmin ? (
          <div className={`group hover:shadow-sm transition px-3 py-3 mt-1 rounded-[2px] ${pathname === APP_ROUTES.PROSPECTS ? "bg-[#2f1b10] text-white shadow-sm" : ""}`}>
            <div className="flex flex-row gap-4 items-center">
              <img src="/prospects.svg" alt="" className={`w-5 h-5 shrink-0 transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6 ${pathname === APP_ROUTES.PROSPECTS ? "invert" : ""}`} />
              <span className={`font-medium text-sm whitespace-nowrap transition-all duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                <Link href={APP_ROUTES.PROSPECTS}>Prospects</Link>
              </span>
            </div>
          </div>
          ) : null}
          {isAdmin ? (
          <div className={`group hover:shadow-sm transition px-3 py-3 mt-1 rounded-[2px] ${pathname === APP_ROUTES.PROPERTIES ? "bg-[#2f1b10] text-white shadow-sm" : ""}`}>
            <div className="flex flex-row gap-4 items-center">
              <img src="/file.svg" alt="" className={`w-5 h-5 shrink-0 transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6 ${pathname === APP_ROUTES.PROPERTIES ? "invert" : ""}`} />
              <span className={`font-medium text-sm whitespace-nowrap transition-all duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                <Link href={APP_ROUTES.PROPERTIES}>Properties</Link>
              </span>
            </div>
          </div>
          ) : null}
          {isAdmin ? (
          <div className={`group hover:shadow-sm transition px-3 py-3 mt-1 rounded-[2px] ${pathname === APP_ROUTES.PIPELINE ? "bg-[#2f1b10] text-white shadow-sm" : ""}`}>
            <div className="flex flex-row gap-4 items-center">
              <img src="/pipeline.svg" alt="" className={`w-5 h-5 shrink-0 transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6 ${pathname === APP_ROUTES.PIPELINE ? "invert" : ""}`} />
              <span className={`font-medium text-sm whitespace-nowrap transition-all duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                <Link href={APP_ROUTES.PIPELINE}>Pipeline</Link>
              </span>
            </div>
          </div>
          ) : null}
          {isAdmin ? (
          <div className={`group hover:shadow-sm transition px-3 py-3 mt-1 rounded-[2px] ${pathname === APP_ROUTES.AI_MATCHING ? "bg-[#2f1b10] text-white shadow-sm" : ""}`}>
            <div className="flex flex-row items-center gap-4">
              <img src="/ai.svg" alt="" className={`w-5 h-5 shrink-0 transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6 ${pathname === APP_ROUTES.AI_MATCHING ? "invert" : ""}`} />
              <span className={`font-medium text-sm whitespace-nowrap transition-all duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                <Link href={APP_ROUTES.AI_MATCHING}>AI Matching</Link>
              </span>
            </div>
          </div>
          ) : null}
          <div className={`group hover:shadow-sm transition px-3 py-3 mt-1 rounded-[2px] ${pathname === APP_ROUTES.APPOINTMENTS ? "bg-[#2f1b10] text-white shadow-sm" : ""}`}>
            <div className="flex flex-row items-center gap-4">
              <img src="/apt.svg" alt="" className={`w-5 h-5 shrink-0 transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6 ${pathname === APP_ROUTES.APPOINTMENTS ? "invert" : ""}`} />
              <span className={`font-medium text-sm whitespace-nowrap transition-all duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                <Link href={APP_ROUTES.APPOINTMENTS}>Appointments</Link>
              </span>
            </div>
          </div>
          {isAdmin ? (
          <div className={`group hover:shadow-sm transition px-3 py-3 mt-1 rounded-[2px] ${pathname === APP_ROUTES.TICKETS || pathname === APP_ROUTES.CHATS ? "bg-[#2f1b10] text-white shadow-sm" : ""}`}>
            <div className="flex flex-row gap-4 items-center justify-start">
              <img src="/ticket.svg" alt="" className={`w-5 h-5 shrink-0 transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6 ${pathname === APP_ROUTES.TICKETS || pathname === APP_ROUTES.CHATS ? "invert" : ""}`} />
              <span className={`font-medium text-sm whitespace-nowrap transition-all duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                <Link href={APP_ROUTES.TICKETS}>Support Tickets</Link>
              </span>
            </div>
          </div>
          ) : null}
          {isAdmin && (
            <div className={`group hover:shadow-sm transition px-3 py-3 mt-1 rounded-[2px] ${pathname === APP_ROUTES.AGENTS ? "bg-[#2f1b10] text-white shadow-sm" : ""}`}>
              <div className="flex flex-row gap-4 items-center">
                <img src="/agent.svg" alt="" className={`w-5 h-5 shrink-0 transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6 ${pathname === APP_ROUTES.AGENTS ? "invert" : ""}`} />
                <span className={`font-medium text-sm whitespace-nowrap transition-all duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                  <Link href={APP_ROUTES.AGENTS}>Agents</Link>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full px-3 border-t border-gray position-sticky h-[10%] flex items-center justify-between">
        <div className="flex flex-row gap-3 items-center">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#b2b1a7] flex items-center justify-center text-sm font-medium uppercase">
            <span className="text-sm font-semibold">{initial}</span>
          </div>
          <div className={`flex flex-col items-baseline text-[13px] transition-all duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
            <span className="font-semibold whitespace-nowrap">{user?.firstName.trim()}</span>
            <span className="text-gray-500 whitespace-nowrap">
              {user?.role && user?.role.charAt(0).toUpperCase() + user?.role.slice(1).toLowerCase()}
            </span>
          </div>
        </div>
        <div className={`relative transition-all duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
          <img
            src="/settings.svg"
            alt=""
            onClick={() => setOpen(!open)}
            className="cursor-pointer transition-all duration-200 hover:-rotate-35"
          />
        </div>
        {open && expanded && (
          <div className="absolute min-w-[200px] bottom-[7%] left-[12.5%] bg-white border shadow p-3 rounded text-sm z-50">
            <p className="py-1 hover:bg-[#F5F5F5] transition cursor-pointer" onClick={() => router.push("/user/profile")}>Mon Profile</p>
            <p className="py-1 hover:bg-[#F5F5F5] transition cursor-pointer" onClick={logout}>Deconnexion</p>
          </div>
        )}
      </div>
    </div>
  );
}
