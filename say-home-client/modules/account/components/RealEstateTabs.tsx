"use client";

import Link from "next/link";
import { useState } from "react";
import { APP_ROUTES } from "@/lib/routes";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useAccount } from "../hooks/useAccount";

const tabs = [
  {
    key: "rented",
    label: "Locations",
    title: "Biens loues",
    description: "Gardez un oeil sur vos locations actives et passees.",
    emptyTitle: "Aucune location pour le moment",
    emptyDescription:
      "Quand une location sera confirmee, vous retrouverez ici les informations importantes.",
    summaryKey: "rentedProperties",
  },
  {
    key: "bought",
    label: "Achats",
    title: "Biens achetes",
    description: "Retrouvez les biens achetes avec votre compte Say Home.",
    emptyTitle: "Aucun achat pour le moment",
    emptyDescription:
      "Les biens achetes seront ajoutes ici pour garder votre historique au meme endroit.",
    summaryKey: "boughtProperties",
  },
  {
    key: "negotiating",
    label: "Negotiations",
    title: "En negociation",
    description: "Suivez vos discussions en cours avec les proprietaires.",
    emptyTitle: "Aucune negotiation en cours",
    emptyDescription:
      "Lorsqu'une discussion demarre autour d'un bien, elle apparaitra dans cet espace.",
    summaryKey: "negotiatingProperties",
  },
] as const;

export default function RealEstateTabs() {
  const [activeKey, setActiveKey] = useState<(typeof tabs)[number]["key"]>(
    "rented",
  );
  const { user } = useAuth();
  const { summary, loading, error } = useAccount(user?.id);
  const activeTab = tabs.find((tab) => tab.key === activeKey) || tabs[0];
  const activeCount = summary?.[activeTab.summaryKey] ?? 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {tabs.map((tab) => {
          const count = summary?.[tab.summaryKey] ?? 0;
          const isActive = tab.key === activeKey;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveKey(tab.key)}
              className={`rounded-[6px] border p-5 text-left transition ${
                isActive
                  ? "border-[#2f1b10] bg-[#2f1b10] text-white shadow-[0_14px_35px_rgba(0,0,0,0.14)]"
                  : "border-[#ded8d1] bg-white text-[#222222] hover:border-[#2f1b10]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">
                    {tab.label}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold">{tab.title}</h3>
                </div>
                <span className="text-3xl font-semibold">
                  {loading ? "..." : count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[6px] border border-[#ded8d1] bg-white shadow-[0_14px_35px_rgba(0,0,0,0.08)]">
        <div className="bg-[#f8f6f2] px-8 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#88786c]">
            Mon espace immobilier
          </p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-[28px] font-semibold text-[#222222]">
                {activeTab.title}
              </h2>
              <p className="mt-2 text-sm text-[#666666]">
                {activeTab.description}
              </p>
            </div>
            <div className="rounded-[4px] bg-white px-4 py-3 text-sm font-semibold text-[#2f1b10]">
              {loading
                ? "Chargement..."
                : `${activeCount} element${activeCount > 1 ? "s" : ""}`}
            </div>
          </div>
        </div>

        <div className="px-8 py-10">
          <div className="flex flex-col items-center justify-center rounded-[6px] border border-dashed border-[#cfc7bf] bg-[#fbfaf8] px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2f1b10] text-xl font-semibold text-white">
              SH
            </div>
            <h3 className="mt-5 text-xl font-semibold text-[#222222]">
              {activeCount > 0 ? activeTab.title : activeTab.emptyTitle}
            </h3>
            <p className="mt-2 max-w-[540px] text-sm leading-6 text-[#666666]">
              {activeCount > 0
                ? activeTab.description
                : activeTab.emptyDescription}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/properties"
                className="rounded-[4px] bg-[#2f1b10] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-95"
              >
                Explorer les biens
              </Link>
              <Link
                href={APP_ROUTES.CONTACT}
                className="rounded-[4px] border border-[#cfc7bf] px-5 py-2.5 text-sm font-medium text-[#444444] transition hover:bg-[#f5f5f3]"
              >
                Contacter Say Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
