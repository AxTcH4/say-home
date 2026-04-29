"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar({ onHero }: { onHero: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.95);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center ${scrolled || !onHero ? "bg-white" : "bg-transparent"}`}
    >
      <nav
        className={`w-[90%] flex items-center justify-between ${scrolled || !onHero ? "border-b border-black" : "border-b border-white"}`}
      >
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo-w-o-bg.png"
            alt="SAY Home"
            className={`mt-1 h-20 w-20 ${scrolled || !onHero ? "invert-0" : "invert-100"}`}
          />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className={`px-5 py-2 text-sm font-medium transition rounded-[1px] ${scrolled || !onHero ? "text-black border border-black" : "text-white border border-white"} hover:bg-[#2C1A0E] hover:border-transparent hover:text-white`}
          >
            Se connecter
          </Link>
        </div>
      </nav>
    </div>
  );
}
