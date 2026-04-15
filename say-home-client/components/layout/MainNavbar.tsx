"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_ROUTES } from "@/lib/routes";
import { useAuth } from "@/modules/auth/hooks/useAuth";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Services", href: "/properties" },
  { label: "A propos", href: "/#about" },
  { label: "Contact", href: APP_ROUTES.CONTACT },
];

export default function MainNavbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="w-full bg-[#f5f5f3]">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-8 py-5">
        <Link
          href="/"
          className="text-[30px] font-extrabold uppercase tracking-tight text-[#111111]"
        >
          LOGO
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[15px] font-semibold transition ${
                  isActive ? "text-[#111111]" : "text-[#222222] hover:text-[#3b2418]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href={APP_ROUTES.DASHBOARD}
                className="border border-[#888888] bg-transparent px-5 py-3 text-sm font-medium text-[#111111] transition hover:bg-white"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={logout}
                className="bg-[#2f1b10] px-5 py-3 text-sm font-medium text-white transition hover:opacity-95"
              >
                Deconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href={APP_ROUTES.LOGIN}
                className="border border-[#888888] bg-transparent px-5 py-3 text-sm font-medium text-[#111111] transition hover:bg-white"
              >
                Se connecter
              </Link>

              <Link
                href={APP_ROUTES.SIGNUP}
                className="bg-[#2f1b10] px-5 py-3 text-sm font-medium text-white transition hover:opacity-95"
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
