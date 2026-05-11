"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { APP_ROUTES } from "@/shared/lib/routes";
import { getMyVisitRequests } from "@/shared/lib/api";

type VisitRequest = {
  id: number;
  propertyId: number | null;
  propertyTitle: string;
  requestedDate: string;
  requestedTime: string;
  message: string;
  status: string;
  agentName: string;
};

function statusLabel(status: string) {
  switch (status) {
    case "REQUESTED":
      return "En attente";
    case "SCHEDULED":
      return "Confirme";
    case "REFUSED":
      return "Refuse";
    case "CANCELLED":
      return "Annule";
    default:
      return status;
  }
}

function statusClasses(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "bg-green-50 text-green-700 border-green-200";
    case "REFUSED":
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export default function MeetingRequestsPanel({ compact = false }: { compact?: boolean }) {
  const [items, setItems] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadRequests = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyVisitRequests();
        if (mounted) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (mounted) {
          setError("Impossible de charger vos rendez-vous.");
          setItems([]);
        }
        console.error(err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadRequests();

    return () => {
      mounted = false;
    };
  }, []);

  const countLabel = useMemo(() => {
    if (loading) {
      return "Chargement...";
    }
    return `${items.length} demande${items.length > 1 ? "s" : ""}`;
  }, [items.length, loading]);

  if (compact) {
    return (
      <div className="rounded-[2px] border border-[#ded8d1] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#88786c]">
              Mes meetings
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[#222222]">
              Rendez-vous et visites
            </h3>
          </div>
          <span className="rounded-[2px] bg-[#f8f6f2] px-3 py-2 text-xs font-semibold text-[#2f1b10]">
            {countLabel}
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-[2px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-[2px] border border-[#ece4da] bg-[#faf8f5]"
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-[2px] border border-[#e5ddd2] bg-[#fcfbf8] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-[#222222]">
                    {item.propertyTitle || "Bien demande"}
                  </p>
                  <p className="mt-1 text-sm text-[#6b5f56]">
                    {item.requestedDate} a {item.requestedTime}
                  </p>
                  <p className="mt-1 text-sm text-[#6b5f56]">
                    Agent: {item.agentName || "Non assigne"}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                    item.status
                  )}`}
                >
                  {statusLabel(item.status)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[2px] border border-dashed border-[#cfc7bf] bg-[#fbfaf8] px-5 py-8 text-center">
            <p className="text-base font-semibold text-[#222222]">
              Aucun meeting pour le moment
            </p>
            <p className="mt-2 text-sm leading-6 text-[#666666]">
              Vos demandes de visite apparaitront ici.
            </p>
            <Link
              href="/properties"
              className="mt-4 inline-flex rounded-[2px] bg-[#2f1b10] px-4 py-2 text-sm font-medium text-white transition hover:opacity-95"
            >
              Explorer les biens
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2px] border border-[#ded8d1] bg-white shadow-[0_14px_35px_rgba(0,0,0,0.08)]">
      <div className="bg-[#f8f6f2] px-8 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#88786c]">
              Rendez-vous
            </p>
            <h2 className="mt-3 text-[28px] font-semibold text-[#222222]">
              Mes demandes de visite
            </h2>
            <p className="mt-2 text-sm text-[#666666]">
              Retrouvez l'etat de vos rendez-vous et les biens que vous avez demandes.
            </p>
          </div>
          <div className="rounded-[2px] bg-white px-4 py-3 text-sm font-semibold text-[#2f1b10]">
            {countLabel}
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {error && (
          <div className="mb-6 rounded-[2px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-[2px] border border-[#ece4da] bg-[#faf8f5]"
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-[2px] border border-[#e5ddd2] bg-[#fcfbf8] p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#222222]">
                      {item.propertyTitle || "Bien demande"}
                    </h3>
                    <p className="mt-1 text-sm text-[#6b5f56]">
                      {item.requestedDate} a {item.requestedTime}
                    </p>
                    <p className="mt-1 text-sm text-[#6b5f56]">
                      Agent: {item.agentName || "Non assigne"}
                    </p>
                    {item.message ? (
                      <p className="mt-3 text-sm leading-6 text-[#666666]">
                        {item.message}
                      </p>
                    ) : null}
                  </div>

                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                      item.status
                    )}`}
                  >
                    {statusLabel(item.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[2px] border border-dashed border-[#cfc7bf] bg-[#fbfaf8] px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2f1b10] text-xl font-semibold text-white">
              RV
            </div>
            <h3 className="mt-5 text-xl font-semibold text-[#222222]">
              Aucun rendez-vous pour le moment
            </h3>
            <p className="mt-2 max-w-[540px] text-sm leading-6 text-[#666666]">
              Quand vous demanderez une visite sur un bien, elle apparaitra ici avec son statut.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/properties"
                className="rounded-[2px] bg-[#2f1b10] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-95"
              >
                Explorer les biens
              </Link>
              <Link
                href={APP_ROUTES.CONTACT}
                className="rounded-[2px] border border-[#cfc7bf] px-5 py-2.5 text-sm font-medium text-[#444444] transition hover:bg-[#f5f5f3]"
              >
                Contacter Say Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
