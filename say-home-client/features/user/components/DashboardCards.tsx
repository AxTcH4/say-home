"use client";

import Link from "next/link";
import { APP_ROUTES } from "@/shared/lib/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAccount } from "../hooks/useAccount";

export default function DashboardCards() {
  const { user } = useAuth();
  const { summary, loading, error } = useAccount(user?.id);

  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "";

  const cards = [
    {
      title: "Mon profil",
      eyebrow: fullName || "Compte Say Home",
      description: "Consultez et modifiez vos informations personnelles.",
      value: user?.phone ? "Tel. ajoute" : "A completer",
      route: APP_ROUTES.PROFILE,
      action: "Gerer mon profil",
    },
    {
      title: "Mes biens",
      eyebrow: "Immobilier",
      description: "Retrouvez vos locations, achats et negotiations.",
      value: loading
        ? "..."
        : `${(summary?.rentedProperties ?? 0) + (summary?.boughtProperties ?? 0) + (summary?.negotiatingProperties ?? 0)} suivi`,
      route: APP_ROUTES.REAL_ESTATE,
      action: "Voir mes biens",
    },
    {
      title: "Mes tickets",
      eyebrow: "Assistance",
      description: "Suivez vos demandes, questions et reclamations.",
      value: loading ? "..." : `${summary?.ticketsCount ?? 0} ouvert`,
      route: APP_ROUTES.TICKETS,
      action: "Voir mes tickets",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[6px] bg-[#2f1b10] px-7 py-6 text-white shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#d8c9bd]">
              Bonjour{fullName ? `, ${fullName}` : ""}
            </p>
            <h2 className="mt-2 text-[26px] font-semibold">
              Tout votre suivi Say Home au meme endroit
            </h2>
          </div>
          <Link
            href={APP_ROUTES.PROFILE}
            className="w-fit rounded-[4px] bg-white px-5 py-2.5 text-sm font-medium text-[#2f1b10] transition hover:bg-[#f3eee9]"
          >
            Modifier mon profil
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.route}
            className="group flex min-h-52 flex-col justify-between rounded-[6px] border border-[#ded8d1] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition hover:-translate-y-1 hover:border-[#2f1b10] hover:shadow-[0_18px_38px_rgba(0,0,0,0.13)]"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-[#88786c]">
                  {card.eyebrow}
                </p>
                <span className="rounded-[4px] bg-[#f8f6f2] px-3 py-1 text-xs font-semibold text-[#2f1b10]">
                  {card.value}
                </span>
              </div>

              <h3 className="mt-6 text-[22px] font-semibold text-[#222222]">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#666666]">
                {card.description}
              </p>
            </div>

            <span className="mt-8 text-sm font-semibold text-[#2f1b10]">
              {card.action}
              <span className="ml-2 transition group-hover:ml-3">-&gt;</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
