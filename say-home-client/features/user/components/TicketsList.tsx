"use client";

import { useEffect, useState } from "react";
import { ticketService } from "../services/ticket.service";
import type { TicketStatus, UserTicket } from "../types/ticket.types";

export default function TicketsList() {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ongoing" | "resolved">(
    "ongoing",
  );

  useEffect(() => {
    let mounted = true;

    const loadTickets = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await ticketService.getMyTickets();
        if (mounted) {
          setTickets(data);
        }
      } catch (loadError) {
        if (mounted) {
          setError("Impossible de charger vos tickets.");
        }
        console.error(loadError);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTickets();

    return () => {
      mounted = false;
    };
  }, []);

  const counts = tickets.reduce(
    (acc, ticket) => {
      if (isResolved(ticket.status)) {
        acc.resolved += 1;
      } else {
        acc.ongoing += 1;
      }
      return acc;
    },
    { ongoing: 0, resolved: 0 },
  );

  const ticketsCount = tickets.length;
  const filteredTickets = tickets.filter((ticket) =>
    activeFilter === "resolved" ? isResolved(ticket.status) : !isResolved(ticket.status),
  );

  const stats = [
    {
      key: "ongoing" as const,
      label: "En cours",
      value: counts.ongoing,
      description: "Dossiers suivis par notre equipe",
    },
    {
      key: "resolved" as const,
      label: "Finis",
      value: counts.resolved,
      description: "Demandes cloturees avec succes",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {stats.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setActiveFilter(item.key)}
            className={`rounded-[2px] border p-5 text-left shadow-[0_14px_35px_rgba(0,0,0,0.06)] transition ${
              activeFilter === item.key
                ? "border-[#2f1b10] bg-[#2f1b10] text-white"
                : "border-[#ded8d1] bg-white text-[#222222] hover:border-[#2f1b10]"
            }`}
          >
            <p
              className={`text-xs font-semibold uppercase tracking-[0.22em] ${
                activeFilter === item.key ? "text-white/75" : "text-[#88786c]"
              }`}
            >
              {item.label}
            </p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <p
                className={`max-w-[190px] text-sm leading-6 ${
                  activeFilter === item.key ? "text-white/85" : "text-[#666666]"
                }`}
              >
                {item.description}
              </p>
              <span
                className={`text-3xl font-semibold ${
                  activeFilter === item.key ? "text-white" : "text-[#2f1b10]"
                }`}
              >
                {loading ? "..." : item.value}
              </span>
            </div>
          </button>
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
            <div className="space-y-6">
              {filteredTickets.length > 0 ? (
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <article
                      key={ticket.id}
                      className="rounded-[2px] border border-[#ded8d1] bg-[#fbfaf8] p-6"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#efe7df] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f6d5f]">
                              Ticket #{String(ticket.id).padStart(4, "0")}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[ticket.status]}`}
                            >
                              {formatStatus(ticket.status)}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[ticket.priority]}`}
                            >
                              Priorite {formatPriority(ticket.priority)}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-[#222222]">
                              {ticket.title}
                            </h3>
                            <p className="mt-2 max-w-[720px] text-sm leading-6 text-[#666666]">
                              {ticket.description?.trim() ||
                                "Aucune description fournie pour ce ticket."}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-[2px] bg-white px-4 py-3 text-sm font-medium text-[#4b4139]">
                          Mis a jour le {formatDate(ticket.updatedAt)}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[2px] border border-dashed border-[#cfc7bf] bg-[#fbfaf8] px-6 py-12 text-center">
                  <h3 className="text-xl font-semibold text-[#222222]">
                    {activeFilter === "ongoing"
                      ? "Aucun ticket en cours"
                      : "Aucun ticket fini"}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#666666]">
                    {activeFilter === "ongoing"
                      ? "Vos demandes actives apparaitront ici des qu'elles seront creees."
                      : "Les tickets termines seront historises ici pour votre suivi."}
                  </p>
                </div>
              )}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const statusStyles: Record<TicketStatus, string> = {
  OPEN: "bg-[#fff4e8] text-[#b45309]",
  IN_PROGRESS: "bg-[#e8f1ff] text-[#1d4ed8]",
  CLOSED: "bg-[#e8f7ee] text-[#047857]",
};

const priorityStyles = {
  HIGH: "bg-[#fdecec] text-[#b91c1c]",
  MEDIUM: "bg-[#fef3c7] text-[#b45309]",
  LOW: "bg-[#edf7ed] text-[#166534]",
};

function isResolved(status: TicketStatus) {
  return status === "CLOSED";
}

function formatStatus(status: TicketStatus) {
  switch (status) {
    case "OPEN":
      return "Ouvert";
    case "IN_PROGRESS":
      return "En cours";
    case "CLOSED":
      return "Fini";
    default:
      return status;
  }
}

function formatPriority(priority: keyof typeof priorityStyles) {
  switch (priority) {
    case "HIGH":
      return "haute";
    case "MEDIUM":
      return "moyenne";
    case "LOW":
      return "basse";
    default:
      return priority;
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
