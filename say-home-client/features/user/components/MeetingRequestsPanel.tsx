"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { APP_ROUTES } from "@/shared/lib/routes";
import {
  getMyVisitRequests,
  requestVisitCancellation,
  requestVisitReschedule,
} from "@/shared/lib/api";

type VisitRequest = {
  id: number;
  propertyId: number | null;
  propertyTitle: string;
  requestedDate: string;
  requestedTime: string;
  message: string;
  requestMessage: string;
  status: string;
  agentName: string;
};

function statusLabel(status: string) {
  switch (status) {
    case "REQUESTED":
      return "En attente";
    case "SCHEDULED":
      return "Confirme";
    case "RESCHEDULE_REQUESTED":
      return "Modification demandee";
    case "CANCELLATION_REQUESTED":
      return "Annulation demandee";
    case "REFUSED":
      return "Refuse";
    case "CANCELLED":
      return "Annule";
    case "COMPLETED":
      return "Termine";
    default:
      return status;
  }
}

function statusClasses(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "bg-green-50 text-green-700 border-green-200";
    case "RESCHEDULE_REQUESTED":
    case "CANCELLATION_REQUESTED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "REFUSED":
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    case "COMPLETED":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export default function MeetingRequestsPanel({ compact = false }: { compact?: boolean }) {
  const [items, setItems] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [requestMode, setRequestMode] = useState<{
    id: number;
    type: "reschedule" | "cancel";
  } | null>(null);
  const [requestForm, setRequestForm] = useState({
    date: "",
    time: "",
    message: "",
  });

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

  async function reloadRequests() {
    try {
      const data = await getMyVisitRequests();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Impossible de charger vos rendez-vous.");
      console.error(err);
    }
  }

  const countLabel = useMemo(() => {
    if (loading) {
      return "Chargement...";
    }
    return `${items.length} demande${items.length > 1 ? "s" : ""}`;
  }, [items.length, loading]);

  const resetRequestForm = () => {
    setRequestMode(null);
    setRequestForm({ date: "", time: "", message: "" });
  };

  const handleSubmitClientRequest = async (item: VisitRequest) => {
    if (!requestMode || requestMode.id !== item.id) {
      return;
    }

    try {
      setSubmittingId(item.id);
      if (requestMode.type === "reschedule") {
        if (!requestForm.date || !requestForm.time) {
          setError("Choisis une nouvelle date et une nouvelle heure.");
          return;
        }

        await requestVisitReschedule(item.id, {
          date: requestForm.date,
          time: requestForm.time,
          message: requestForm.message,
        });
      } else {
        await requestVisitCancellation(item.id, {
          message: requestForm.message,
        });
      }

      resetRequestForm();
      setError("");
      await reloadRequests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'envoyer votre demande."
      );
    } finally {
      setSubmittingId(null);
    }
  };

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
                className="rounded-[2px] border border-[#e5ddd2] bg-[#fcfbf8] p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
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
                    {item.requestMessage ? (
                      <p className="mt-1 text-sm text-[#6b5f56]">
                        Demande: {item.requestMessage}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                        item.status
                      )}`}
                    >
                      {statusLabel(item.status)}
                    </span>
                    {item.status === "SCHEDULED" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRequestMode({ id: item.id, type: "reschedule" });
                            setRequestForm({ date: "", time: "", message: "" });
                          }}
                          className="rounded-[2px] border border-[#2f1b10] px-3 py-2 text-xs font-semibold text-[#2f1b10] transition hover:bg-[#f5f1ec]"
                        >
                          Demander modification
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRequestMode({ id: item.id, type: "cancel" });
                            setRequestForm({ date: "", time: "", message: "" });
                          }}
                          className="rounded-[2px] border border-[#d9cfc3] px-3 py-2 text-xs font-semibold text-[#5a4a3e] transition hover:bg-[#f7f4ef]"
                        >
                          Demander annulation
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {requestMode?.id === item.id ? (
                  <div className="mt-4 rounded-[2px] border border-[#ded8d1] bg-white p-4">
                    <p className="text-sm font-semibold text-[#222222]">
                      {requestMode.type === "reschedule"
                        ? "Demande de modification"
                        : "Demande d'annulation"}
                    </p>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {requestMode.type === "reschedule" ? (
                        <>
                          <input
                            type="date"
                            value={requestForm.date}
                            onChange={(event) =>
                              setRequestForm((current) => ({
                                ...current,
                                date: event.target.value,
                              }))
                            }
                            className="rounded-[2px] border border-[#d8d0c6] px-3 py-2 text-sm text-[#222222]"
                          />
                          <input
                            type="time"
                            value={requestForm.time}
                            onChange={(event) =>
                              setRequestForm((current) => ({
                                ...current,
                                time: event.target.value,
                              }))
                            }
                            className="rounded-[2px] border border-[#d8d0c6] px-3 py-2 text-sm text-[#222222]"
                          />
                        </>
                      ) : null}

                      <textarea
                        rows={3}
                        value={requestForm.message}
                        onChange={(event) =>
                          setRequestForm((current) => ({
                            ...current,
                            message: event.target.value,
                          }))
                        }
                        placeholder="Ajoutez un message pour notre equipe..."
                        className="rounded-[2px] border border-[#d8d0c6] px-3 py-2 text-sm text-[#222222] md:col-span-2"
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={submittingId === item.id}
                        onClick={() => void handleSubmitClientRequest(item)}
                        className="rounded-[2px] bg-[#2f1b10] px-4 py-2 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-60"
                      >
                        {submittingId === item.id ? "Envoi..." : "Envoyer ma demande"}
                      </button>
                      <button
                        type="button"
                        onClick={resetRequestForm}
                        className="rounded-[2px] border border-[#d8d0c6] px-4 py-2 text-sm font-medium text-[#444444]"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : null}
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
                    {item.requestMessage ? (
                      <p className="mt-3 text-sm leading-6 text-[#666666]">
                        Demande en cours: {item.requestMessage}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                        item.status
                      )}`}
                    >
                      {statusLabel(item.status)}
                    </span>

                    {item.status === "SCHEDULED" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRequestMode({ id: item.id, type: "reschedule" });
                            setRequestForm({ date: "", time: "", message: "" });
                          }}
                          className="rounded-[2px] border border-[#2f1b10] px-3 py-2 text-xs font-semibold text-[#2f1b10] transition hover:bg-[#f5f1ec]"
                        >
                          Demander modification
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRequestMode({ id: item.id, type: "cancel" });
                            setRequestForm({ date: "", time: "", message: "" });
                          }}
                          className="rounded-[2px] border border-[#d9cfc3] px-3 py-2 text-xs font-semibold text-[#5a4a3e] transition hover:bg-[#f7f4ef]"
                        >
                          Demander annulation
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {requestMode?.id === item.id ? (
                  <div className="mt-4 rounded-[2px] border border-[#ded8d1] bg-white p-4">
                    <p className="text-sm font-semibold text-[#222222]">
                      {requestMode.type === "reschedule"
                        ? "Demande de modification"
                        : "Demande d'annulation"}
                    </p>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {requestMode.type === "reschedule" ? (
                        <>
                          <input
                            type="date"
                            value={requestForm.date}
                            onChange={(event) =>
                              setRequestForm((current) => ({
                                ...current,
                                date: event.target.value,
                              }))
                            }
                            className="rounded-[2px] border border-[#d8d0c6] px-3 py-2 text-sm text-[#222222]"
                          />
                          <input
                            type="time"
                            value={requestForm.time}
                            onChange={(event) =>
                              setRequestForm((current) => ({
                                ...current,
                                time: event.target.value,
                              }))
                            }
                            className="rounded-[2px] border border-[#d8d0c6] px-3 py-2 text-sm text-[#222222]"
                          />
                        </>
                      ) : null}

                      <textarea
                        rows={3}
                        value={requestForm.message}
                        onChange={(event) =>
                          setRequestForm((current) => ({
                            ...current,
                            message: event.target.value,
                          }))
                        }
                        placeholder="Ajoutez un message pour notre equipe..."
                        className={`rounded-[2px] border border-[#d8d0c6] px-3 py-2 text-sm text-[#222222] ${
                          requestMode.type === "reschedule" ? "md:col-span-2" : "md:col-span-2"
                        }`}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={submittingId === item.id}
                        onClick={() => void handleSubmitClientRequest(item)}
                        className="rounded-[2px] bg-[#2f1b10] px-4 py-2 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-60"
                      >
                        {submittingId === item.id ? "Envoi..." : "Envoyer ma demande"}
                      </button>
                      <button
                        type="button"
                        onClick={resetRequestForm}
                        className="rounded-[2px] border border-[#d8d0c6] px-4 py-2 text-sm font-medium text-[#444444]"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : null}
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
