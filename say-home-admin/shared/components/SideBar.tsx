"use client";
import Link from "next/link";
import { APP_ROUTES } from "@/shared/lib/routes";
import { usePathname } from "next/navigation";

export default function SideBar() {
    const pathname = usePathname();
  return (
    <div className="h-screen w-[17%] border border-black shadow-[0_5px_2px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between text-black">
      <div>
        <div className="">
          <div className="px-15 pb-4">
            <img src="/logo-w-o-bg.png" alt="SAY HOME" className="w-21 h-21" />
          </div>
          <div className={`hover:shadow-sm transition px-8 py-4 ${pathname === APP_ROUTES.HOME ? "bg-[#2f1b10] text-white" : "bg-gray"}`}>
            <div className="flex flex-row gap-4 items-center ">
              <img src="/dashboard.svg" alt="" className={`${pathname === APP_ROUTES.HOME ? "invert-100" : " "}`}/>
              <Link href={APP_ROUTES.HOME} className="font-semibold text-base"> Dashboard </Link>
            </div>
          </div>
          <div className={`hover:shadow-sm transition px-8 py-4 ${pathname === APP_ROUTES.PROSPECTS ? "bg-[#2f1b10] text-white" : "bg-gray"}`}>
            <div className="flex flex-row gap-4 items-center ">
              <img src="/prospects.svg" alt="" className={`${pathname === APP_ROUTES.PROSPECTS? "invert-100" : " "}`}/>
              <Link href={APP_ROUTES.PROSPECTS} className="font-semibold text-base">Prospects </Link>
            </div>
          </div>
          <div className={`hover:shadow-sm transition px-8 py-4 ${pathname === APP_ROUTES.PROPERTIES ? "bg-[#2f1b10] text-white" : "bg-gray"}`}>
            <div className="flex flex-row gap-4 items-center ">
              <img src="/property.svg" alt="" className={`${pathname === APP_ROUTES.PROPERTIES ? "invert-100" : " "}`}/>
              <Link href={APP_ROUTES.PROPERTIES} className="font-semibold text-base">Properties </Link>
            </div>
          </div>
          <div className="hover:shadow-sm transition bg-gray px-8 py-4">
            <div className="flex flex-row gap-4 items-center ">
              <img src="/pipeline.svg" alt="" className={`${pathname === APP_ROUTES.PIPELINE ? "invert-100" : " "}`}/>
              <Link href="#" className="font-semibold text-base"> Pipeline </Link>
            </div>
          </div>
          <div className={`hover:shadow-sm transition px-8 py-4 ${pathname === APP_ROUTES.AI_MATCHING ? "bg-[#2f1b10] text-white" : "bg-gray"}`}>
            <div className="flex flex-row items-center gap-4">
              <img src="/ai.svg" alt="" className={`${pathname === APP_ROUTES.AI_MATCHING ? "invert-100" : " "}`}/>
              <Link href={APP_ROUTES.AI_MATCHING} className="font-semibold text-base"> AI Matching</Link>
            </div>
          </div>
          <div className="hover:shadow-sm transition bg-gray px-8 py-4">
            <div className="flex flex-row items-center gap-4">
              <img src="/apt.svg" alt="" className={`${pathname === APP_ROUTES.APPOINTMENTS ? "invert-100" : " "}`}/>
              <Link href="#" className="font-semibold text-base"> Appointments</Link>
            </div>
          </div>
          <div className={`hover:shadow-sm transition px-8 py-4 ${pathname === APP_ROUTES.TICKETS ? "bg-[#2f1b10] text-white" : "bg-gray"}`}>
            <div className="flex flex-row gap-4 items-center ">
              <img src="/ticket.svg" alt="" className={`${pathname === APP_ROUTES.TICKETS ? "invert-100" : " "}`}/>
              <Link href={APP_ROUTES.TICKETS} className="font-semibold text-base">Support Tickets</Link>
            </div>
          </div>
          <div className={`hover:shadow-sm transition px-8 py-4 ${pathname === APP_ROUTES.AGENTS ? "bg-[#2f1b10] text-white" : "bg-gray"}`}>
            <div className="flex flex-row gap-4 items-center ">
              <img src="/agent.svg" alt="" className={`${pathname === APP_ROUTES.AGENTS ? "invert-100" : " "}`}/>
              <Link href={APP_ROUTES.AGENTS} className="font-semibold text-base">Agents</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="px-8 py-4 border-t border-gray position-sticky bg-black">
        {/* user info goes here */}
      </div>
    </div>
  );
}