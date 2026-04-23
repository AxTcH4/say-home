"use client";   
import { useState } from "react";
export default function TopBar() {
    const [isNotificationsOpened, setIsNotificationsOpened] = useState(false);
    return (
        <div className="w-full bg-gray text-black my-[1vh] shadow-[0_5px_2px_-3px_rgba(0,0,0,0.05)]">
           
            <div className="flex flex-row justify-between items-center px-8 py-4">
                 <div className="w-[10px] "></div>
                <div className="w-[35%] h-10 rounded-[2px] bg-[#f5f5f3] px-2 flex flex-row gap-3 align-center px-4 py-2">
                    <img src="/search.svg" alt="" />
                <input type="search" placeholder="Rechercher" className="bg-transparent outline-none"  />

                </div>
                <div className=" relative flex justify-between items-center gap-6">
                    <img 
                    src="/bell.svg" className="bell-ring" alt="" 
                    onClick={()=>setIsNotificationsOpened(!isNotificationsOpened)}
                    />
                    <button className="w-fit px-6 py-[9px] text-sm bg-[#2C1A0E] text-white  hover:scale-105 transition rounded-[1px]">
                        &#10010;Add New
                    </button>
                    {
                        isNotificationsOpened && (
                            <div className="absolute top-12 right-0 w-[300px] bg-white shadow-[0_5px_2px_-3px_rgba(0,0,0,0.05)] rounded-[2px]">
                                <div className="p-4">
                                    <p className="text-[#2C1A0E] text-sm font-semibold">
                                        You're up to date!
                                    </p>
                                </div>
                            </div>
                        )
                    }
                </div>

            </div>
        </div>
    )
}