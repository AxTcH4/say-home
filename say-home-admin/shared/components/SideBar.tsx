"use client";
import Link from "next/link";
import { APP_ROUTES } from "@/shared/lib/routes";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();
  // const { user } = useAuth();
  const user = {
    firstName: "Abderrahmane",
    lastName: "Techa",
    email: "M5Y8o@example.com",
    role: "agent",
  };
  const [open, setOpen] = useState(false);
  const initial = useMemo(() => {
    if (!user) return "";
    const first = user?.firstName?.trim().charAt(0) ?? "";
    const last = user?.lastName?.trim().charAt(0) ?? "";
    return `${first}${last}`.toUpperCase();
  }, [user]);
  return (
    <div className="h-screen w-[14%] border border-black shadow-[0_5px_2px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between items-center text-black">
      <div className="w-[90%] mx-2">
        <div className="">
          <div className="px-14 pb-4">
            <img
              src="/logo-w-o-bg.png"
              alt="SAY HOME"
              className="w-19 h-19 mt-2"
            />
          </div>
          <div
            className={`group hover:shadow-sm transition px-6 py-3 mt-1 rounded-[2px] ${pathname === APP_ROUTES.HOME ? "bg-[#2f1b10] text-white shadow-sm" : "bg-gray"}`}
          >
            <div className="flex flex-row gap-4 items-center justify-start ">
              <img
                src="/dashboard.svg"
                alt=""
                className={`transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6 ${pathname === APP_ROUTES.HOME ? "invert" : ""}`}
              />
              <Link href={APP_ROUTES.HOME} className="font-medium text-sm">
                {" "}
                Dashboard{" "}
              </Link>
            </div>
          </div>
          <div
            className={`group hover:shadow-sm transition px-6 py-3 mt-1 rounded-[2px] ${pathname === APP_ROUTES.PROSPECTS ? "bg-[#2f1b10] text-white shadow-sm" : "bg-gray"}`}
          >
            <div className="flex flex-row gap-4 items-center ">
              <img
                src="/prospects.svg"
                alt=""
                className={`transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6 ${pathname === APP_ROUTES.PROSPECTS ? "invert" : ""}`}
              />
              <Link href={APP_ROUTES.PROSPECTS} className="font-medium text-sm">
                Prospects{" "}
              </Link>
            </div>
          </div>
          <div
            className={`group hover:shadow-sm transition px-6 py-3 mt-1 rounded-[2px] ${pathname === APP_ROUTES.PROPERTIES ? "bg-[#2f1b10] text-white shadow-sm" : "bg-gray"}`}
          >
            <div className="flex flex-row gap-4 items-center ">
              <img
                src="/property.svg"
                alt=""
                className={`transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6 ${pathname === APP_ROUTES.PROPERTIES ? "invert" : ""}`}
              />
              <Link
                href={APP_ROUTES.PROPERTIES}
                className="font-medium text-sm"
              >
                Properties{" "}
              </Link>
            </div>
          </div>
          <div className="group hover:shadow-sm transition bg-gray px-6 py-4">
            <div className="flex flex-row gap-4 items-center ">
              <img
                src="/pipeline.svg"
                alt=""
                className="transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6"
              />
              <Link href="#" className="font-medium text-sm">
                {" "}
                Pipeline{" "}
              </Link>
            </div>
          </div>
          <div
            className={`group hover:shadow-sm transition px-6 py-3 mt-1 rounded-[2px] ${pathname === APP_ROUTES.AI_MATCHING ? "bg-[#2f1b10] text-white shadow-sm" : "bg-gray"}`}
          >
            <div className="flex flex-row items-center gap-4">
              <img
                src="/ai.svg"
                alt=""
                className={`transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6 ${pathname === APP_ROUTES.AI_MATCHING ? "invert" : ""}`}
              />
              <Link
                href={APP_ROUTES.AI_MATCHING}
                className="font-medium text-sm"
              >
                {" "}
                AI Matching
              </Link>
            </div>
          </div>
          <div className="group hover:shadow-sm transition bg-gray px-6 py-4">
            <div className="flex flex-row items-center gap-4">
              <img
                src="/apt.svg"
                alt=""
                className="transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6"
              />
              <Link href="#" className="font-medium text-sm">
                {" "}
                Appointments
              </Link>
            </div>
          </div>
          <div
            className={`group hover:shadow-sm transition px-6 py-3 mt-1 rounded-[2px] ${pathname === APP_ROUTES.TICKETS || pathname === APP_ROUTES.CHATS ? "bg-[#2f1b10] text-white shadow-sm" : "bg-gray"}`}
          >
            <div className="flex flex-row gap-4 items-center justify-start ">
              <img
                src="/ticket.svg"
                alt=""
                className={`transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6 ${pathname === APP_ROUTES.TICKETS || pathname === APP_ROUTES.CHATS ? "invert" : ""}`}
              />
              <Link href={APP_ROUTES.TICKETS} className="font-medium text-sm">
                Support Tickets
              </Link>
            </div>
          </div>
          <div
            className={`group hover:shadow-sm transition px-6 py-3 mt-1 rounded-[2px] mt-2 ${pathname === APP_ROUTES.AGENTS ? "bg-[#2f1b10] text-white shadow-sm" : "bg-gray"}`}
          >
            <div className="flex flex-row gap-4 items-center ">
              <img
                src="/agent.svg"
                alt=""
                className={`transition-all duration-200 group-hover:scale-115 group-hover:-rotate-6 ${pathname === APP_ROUTES.AGENTS ? "invert" : ""}`}
              />
              <Link href={APP_ROUTES.AGENTS} className="font-medium text-sm">
                Agents
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-6 border-t border-gray position-sticky h-[10%] flex items-center justify-between ">
        <div className="flex flex-row gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-[#b2b1a7] flex items-center justify-center text-sm font-medium uppercase ">
            <span className="text-sm [#b2b1a7] font-semibold">{initial}</span>
          </div>

          <div className="flex flex-col items-baseline text-[13px] ">
            <span className="font-semibold">{user?.firstName.trim()}</span>
            <span className="text-gray-500 font-regular">
              {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
            </span>
          </div>
        </div>

        <div className="relative">
          <img
            src="/settings.svg"
            alt=""
            onClick={() => setOpen(!open)}
            className="cursor-pointer  transition-all duration-200 hover:-rotate-35"
          />
        </div>

        {open && (
          <div className="absolute min-w-[200px] bottom-[7%] left-[12.5%] bg-white border shadow p-3 rounded text-sm">
            <p
              className="py-1 hover:bg-[#F5F5F5] transition"
              onClick={() => {
                router.push("/user/profile");
              }}
            >
              Mon Profile
            </p>

            <p
              className="py-1 hover:bg-[#F5F5F5] transition"
              onClick={async () => {
                // await logout();
                router.push("/");
              }}
            >
              Déconnexion
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
