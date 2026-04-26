"use client";
import SideBar from "@/shared/components/SideBar";
import TopBar from "@/shared/components/TopBar";
import { useState } from "react";

export default function Layout({ children}: { children: React.ReactNode }) {
  
const [isSearchOpened, setIsSearchOpened] = useState(false);
  return (
    <div 
    onClick={()=>{setIsSearchOpened(false)}}  
    className="flex h-screen overflow-hidden">
      <SideBar />
      <div className="flex flex-col flex-1 ">
        <TopBar
        isSearchOpened={isSearchOpened}
        setIsSearchOpened={setIsSearchOpened}
         />
        <main className="flex-1 overflow-hidden p-4 ">{children}</main>
      </div>
    </div>
  );
}
