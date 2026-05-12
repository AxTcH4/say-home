"use client";

import Link from "next/link";
import { useState } from "react";
import { APP_ROUTES } from "@/shared/lib/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAccount } from "../hooks/useAccount";
import MeetingRequestsPanel from "./MeetingRequestsPanel";
import type {
  RealEstateDocument,
  RealEstateDocumentType,
  RealEstateRecord,
} from "../types/account.types";

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
    label: "Negociations",
    title: "Mes negotiations",
    description: "Retrouvez simplement vos rendez-vous et visites en cours.",
    emptyTitle: "Aucune negotiation en cours",
    emptyDescription:
      "Quand vous demanderez une visite, elle apparaitra ici avec son statut.",
    summaryKey: "negotiatingProperties",
  },
] as const;

export default function RealEstateTabs() {
  const [activeKey, setActiveKey] = useState<(typeof tabs)[number]["key"]>(
    "rented",
  );
  const { user } = useAuth();
  const { summary, realEstate, loading, error } = useAccount(user?.id);
  const activeTab = tabs.find((tab) => tab.key === activeKey) || tabs[0];
  const activeCount = summary?.[activeTab.summaryKey] ?? 0;
  const activeRecords = realEstate.filter((record) => {
    if (activeKey === "bought") return record.relationStatus === "BOUGHT";
    if (activeKey === "rented") return record.relationStatus === "RENTED";
    return record.relationStatus === "NEGOTIATING";
  });

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
              className={`rounded-[2px] border p-5 text-left transition ${
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
        <div className="rounded-[2px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {activeKey === "negotiating" ? (
        activeRecords.length > 0 ? (
          <div className="overflow-hidden rounded-[2px] border border-[#ded8d1] bg-white shadow-[0_14px_35px_rgba(0,0,0,0.08)]">
            <SectionHeader
              title={activeTab.title}
              description={activeTab.description}
              count={activeCount}
              loading={loading}
            />
            <div className="space-y-4 px-8 py-10">
              {activeRecords.map((record) => (
                <RealEstateRecordCard key={record.id} record={record} />
              ))}
            </div>
          </div>
        ) : (
          <MeetingRequestsPanel compact />
        )
      ) : (
        <div className="overflow-hidden rounded-[2px] border border-[#ded8d1] bg-white shadow-[0_14px_35px_rgba(0,0,0,0.08)]">
          <SectionHeader
            title={activeTab.title}
            description={activeTab.description}
            count={activeCount}
            loading={loading}
          />

          <div className="px-8 py-10">
            {activeRecords.length > 0 ? (
              <div className="space-y-4">
                {activeRecords.map((record) => (
                  <RealEstateRecordCard key={record.id} record={record} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[2px] border border-dashed border-[#cfc7bf] bg-[#fbfaf8] px-6 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2f1b10] text-xl font-semibold text-white">
                  SH
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[#222222]">
                  {activeTab.emptyTitle}
                </h3>
                <p className="mt-2 max-w-[540px] text-sm leading-6 text-[#666666]">
                  {activeTab.emptyDescription}
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
      )}
    </div>
  );
}

function SectionHeader({
  title,
  description,
  count,
  loading,
}: {
  title: string;
  description: string;
  count: number;
  loading: boolean;
}) {
  return (
    <div className="bg-[#f8f6f2] px-8 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#88786c]">
        Mon espace immobilier
      </p>
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-semibold text-[#222222]">{title}</h2>
          <p className="mt-2 text-sm text-[#666666]">{description}</p>
        </div>
        <div className="rounded-[2px] bg-white px-4 py-3 text-sm font-semibold text-[#2f1b10]">
          {loading ? "Chargement..." : `${count} element${count > 1 ? "s" : ""}`}
        </div>
      </div>
    </div>
  );
}

function RealEstateRecordCard({ record }: { record: RealEstateRecord }) {
  const cover = record.medias?.[0] || "/placeholder.jpg";

  return (
    <article className="overflow-hidden rounded-[2px] border border-[#ded8d1] bg-[#fbfaf8]">
      <div className="grid gap-0 md:grid-cols-[260px_minmax(0,1fr)]">
        <div
          className="min-h-[220px] bg-[#ece8e2]"
          style={{
            backgroundImage: `url(${cover})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="space-y-5 px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#88786c]">
                {record.propertyType || "Bien"} • {record.propertySector || "Secteur non precise"}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[#222222]">
                {record.propertyTitle}
              </h3>
            </div>
            <div className="rounded-full bg-[#2f1b10] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
              {formatRelationStatus(record.relationStatus)}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <InfoPill label="Prix affiche" value={formatAmount(record.propertyPrice)} />
            <InfoPill
              label="Prix final"
              value={record.finalPrice ? formatAmount(record.finalPrice) : "Non renseigne"}
            />
            <InfoPill label="Statut du bien" value={record.propertyStatus} />
            <InfoPill label="Mis a jour" value={formatDate(record.updatedAt)} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#88786c]">
              Notes
            </p>
            <p className="mt-2 text-sm leading-6 text-[#666666]">
              {record.notes?.trim() || "Aucune note disponible pour ce dossier."}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#88786c]">
              Documents
            </p>
            {record.documents.length > 0 ? (
              <div className="mt-3 flex flex-col gap-2">
                {record.documents.map((document) => (
                  <DocumentItem key={document.id} document={document} />
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-[#666666]">
                Aucun document ajoute pour ce bien.
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2px] border border-[#ded8d1] bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#88786c]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[#2f1b10]">{value}</p>
    </div>
  );
}

function DocumentItem({ document }: { document: RealEstateDocument }) {
  return (
    <a
      href={document.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between rounded-[2px] border border-[#ded8d1] bg-white px-4 py-3 text-sm transition hover:border-[#2f1b10]"
    >
      <div>
        <p className="font-semibold text-[#222222]">{document.name}</p>
        <p className="mt-1 text-xs text-[#666666]">
          {formatDocumentType(document.type)} • {formatDate(document.uploadedAt)}
        </p>
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2f1b10]">
        Voir
      </span>
    </a>
  );
}

function formatRelationStatus(status: RealEstateRecord["relationStatus"]) {
  switch (status) {
    case "BOUGHT":
      return "Achete";
    case "RENTED":
      return "Loue";
    case "NEGOTIATING":
      return "En negociation";
    case "FAVORITE":
      return "Favori";
    default:
      return status;
  }
}

function formatDocumentType(type: RealEstateDocumentType) {
  switch (type) {
    case "RECEIPT":
      return "Recu";
    case "CONTRACT":
      return "Contrat";
    case "PAYMENT_PROOF":
      return "Preuve de paiement";
    case "ID_COPY":
      return "Copie d'identite";
    case "OTHER":
      return "Autre";
    default:
      return type;
  }
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(date);
}
