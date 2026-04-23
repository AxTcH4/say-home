"use client";

import Link from "next/link";
import { APP_ROUTES } from "@/shared/lib/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAccount } from "../hooks/useAccount";

export default function TicketsList() {
  const { user } = useAuth();
  const { summary, loading, error } = useAccount(user?.id);
  const ticketsCount = summary?.ticketsCount ?? 0;

  const stats = [
    {
      label: "Tickets ouverts",
      value: ticketsCount,
      description: "Demandes en attente de traitement",
    },
    {
      label: "En cours",
      value: 0,
      description: "Dossiers suivis par notre equipe",
    },
    {
      label: "Resolus",
      value: 0,
      description: "Demandes cloturees avec succes",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-[2px] border border-[#ded8d1] bg-white p-5 shadow-[0_14px_35px_rgba(0,0,0,0.06)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#88786c]">
              {item.label}
            </p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <p className="max-w-[190px] text-sm leading-6 text-[#666666]">
                {item.description}
              </p>
              <span className="text-3xl font-semibold text-[#2f1b10]">
                {loading ? "..." : item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-[2px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[2px] border border-[#ded8d1] bg-white shadow-[0_14px_35px_rgba(0,0,0,0.08)]">
        <div className="bg-[#f8f6f2] px-8 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#88786c]">
            Assistance Say Home
          </p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-[28px] font-semibold text-[#222222]">
                Mes demandes
              </h2>
              <p className="mt-2 text-sm text-[#666666]">
                Suivez vos reclamations, questions et demandes d'aide.
              </p>
            </div>
            <div className="rounded-[2px] bg-white px-4 py-3 text-sm font-semibold text-[#2f1b10]">
              {loading
                ? "Chargement..."
                : `${ticketsCount} ticket${ticketsCount > 1 ? "s" : ""}`}
            </div>
          </div>
        </div>

        <div className="px-8 py-10">
          {ticketsCount > 0 ? (
            <div className="rounded-[2px] border border-[#ded8d1] bg-[#f8f6f2] p-6">
              <h3 className="text-lg font-semibold text-[#222222]">
                Demandes en cours
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#666666]">
                Notre equipe suit vos demandes et revient vers vous avec une
                reponse claire des que possible.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[2px] border border-dashed border-[#cfc7bf] bg-[#fbfaf8] px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2f1b10] text-xl font-semibold text-white">
                ?
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#222222]">
                Aucun ticket pour le moment
              </h3>
              <p className="mt-2 max-w-[540px] text-sm leading-6 text-[#666666]">
                Si vous avez une question sur un bien, une visite ou votre
                compte, envoyez-nous un message. Votre demande sera traitee par
                l'equipe Say Home.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={APP_ROUTES.CONTACT}
                  className="rounded-[2px] bg-[#2f1b10] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-95"
                >
                  Creer une demande
                </Link>
                <Link
                  href={APP_ROUTES.HOME}
                  className="rounded-[2px] border border-[#cfc7bf] px-5 py-2.5 text-sm font-medium text-[#444444] transition hover:bg-[#f5f5f3]"
                >
                  Retour au dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
