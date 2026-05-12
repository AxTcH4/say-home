"use client";

import { useState } from "react";
import type {
  ProspectDetail,
  ProspectPropertyDocument,
  ProspectPropertyRecord,
  ProspectPropertyRelationStatus,
} from "../types/prospect.types";

interface ProspectDetailTabsProps {
  prospect: ProspectDetail;
}

type TabKey = "info" | "properties" | "interactions" | "meetings" | "feedback";

const tabs: { key: TabKey; label: string }[] = [
  { key: "info", label: "Info" },
  { key: "properties", label: "Biens" },
  { key: "interactions", label: "Interactions" },
  { key: "meetings", label: "Meetings" },
  { key: "feedback", label: "Feedback" },
];

export function ProspectDetailTabs({ prospect }: ProspectDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  return (
    <div className="rounded-[18px] border border-[#e7edf5] bg-white shadow-[0_12px_35px_rgba(20,32,60,0.06)]">
      <div className="flex flex-wrap gap-2 border-b border-[#edf2f8] px-5 py-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-[10px] px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-[#2c1a0e] text-white"
                : "bg-[#f6f8fc] text-[#61728b]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-5 py-5">
        {activeTab === "info" && (
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard label="Project Type" value={prospect.projectType} />
            <InfoCard label="Created At" value={prospect.createdAt} />
            <div className="md:col-span-2">
              <InfoCard label="General Notes" value={prospect.notes} />
            </div>
          </div>
        )}

        {activeTab === "interactions" && (
          <DataList
            emptyText="No interactions yet."
            items={prospect.interactions.map((interaction) => ({
              id: interaction.id,
              title: `${interaction.type} - ${interaction.date}`,
              subtitle: interaction.comment,
            }))}
          />
        )}

        {activeTab === "meetings" && (
          <DataList
            emptyText="No meetings scheduled yet."
            items={prospect.meetings.map((meeting) => ({
              id: meeting.id,
              title: `${meeting.type} - ${meeting.date} at ${meeting.time}`,
              subtitle: `Status: ${meeting.status}`,
            }))}
          />
        )}

        {activeTab === "feedback" && (
          <DataList
            emptyText="No feedback yet."
            items={prospect.feedback.map((feedback) => ({
              id: feedback.id,
              title: `${feedback.satisfaction} - ${feedback.date}`,
              subtitle: feedback.comment,
            }))}
          />
        )}

        {activeTab === "properties" && (
          <PropertyPortfolio records={prospect.propertyRecords} />
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[#edf2f8] bg-[#fbfcfe] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8ca2]">
        {label}
      </p>
      <p className="mt-3 text-sm leading-6 text-[#172033]">{value}</p>
    </div>
  );
}

function DataList({
  emptyText,
  items,
}: {
  emptyText: string;
  items: { id: number; title: string; subtitle: string }[];
}) {
  if (items.length === 0) {
    return <p className="text-sm text-[#70819a]">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-[14px] border border-[#edf2f8] bg-[#fbfcfe] px-4 py-4"
        >
          <p className="text-sm font-semibold text-[#172033]">{item.title}</p>
          <p className="mt-2 text-sm text-[#61728b]">{item.subtitle}</p>
        </div>
      ))}
    </div>
  );
}

const propertySections: {
  key: ProspectPropertyRelationStatus;
  label: string;
  emptyText: string;
}[] = [
  {
    key: "FAVORITE",
    label: "Favoris",
    emptyText: "Aucun bien en favoris pour le moment.",
  },
  {
    key: "NEGOTIATING",
    label: "En negociation",
    emptyText: "Aucun bien en negociation.",
  },
  {
    key: "BOUGHT",
    label: "Biens achetes",
    emptyText: "Aucun achat finalise.",
  },
  {
    key: "RENTED",
    label: "Biens loues",
    emptyText: "Aucune location finalisee.",
  },
];

const relationStyles: Record<ProspectPropertyRelationStatus, string> = {
  FAVORITE: "bg-[#eff6ff] text-[#1d4ed8]",
  NEGOTIATING: "bg-[#fff7ed] text-[#c2410c]",
  BOUGHT: "bg-[#ecfdf5] text-[#047857]",
  RENTED: "bg-[#f5f3ff] text-[#6d28d9]",
};

const documentTypeLabels: Record<string, string> = {
  RECEIPT: "Recu",
  CONTRACT: "Contrat",
  PAYMENT_PROOF: "Preuve de paiement",
  ID_COPY: "Copie d'identite",
  OTHER: "Autre",
};

function PropertyPortfolio({ records }: { records: ProspectPropertyRecord[] }) {
  return (
    <div className="space-y-6">
      {propertySections.map((section) => {
        const sectionItems = records.filter(
          (record) => record.relationStatus === section.key,
        );

        return (
          <section key={section.key} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[#172033]">
                  {section.label}
                </h3>
                <p className="mt-1 text-sm text-[#70819a]">
                  {sectionItems.length} dossier
                  {sectionItems.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {sectionItems.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-[#d9e2ef] bg-[#fbfcfe] px-4 py-5 text-sm text-[#70819a]">
                {section.emptyText}
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {sectionItems.map((record) => (
                  <PropertyRecordCard key={record.id} record={record} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function PropertyRecordCard({ record }: { record: ProspectPropertyRecord }) {
  const cover = record.medias[0] ?? "/placeholder.jpg";

  return (
    <article className="overflow-hidden rounded-[18px] border border-[#e7edf5] bg-[#fbfcfe]">
      <div className="flex flex-col md:flex-row">
        <div className="h-48 w-full bg-[#edf2f8] md:h-auto md:w-44">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={record.propertyTitle}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex-1 px-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8ca2]">
                {record.propertyType || "Bien"} • {record.propertySector || "Secteur non precise"}
              </p>
              <h4 className="mt-2 text-lg font-semibold text-[#172033]">
                {record.propertyTitle}
              </h4>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${relationStyles[record.relationStatus]}`}
            >
              {formatRelationStatus(record.relationStatus)}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Metric label="Prix affiche" value={formatAmount(record.propertyPrice)} />
            <Metric
              label="Prix final"
              value={record.finalPrice ? formatAmount(record.finalPrice) : "Non renseigne"}
            />
            <Metric label="Statut du bien" value={record.propertyStatus} />
            <Metric label="Derniere mise a jour" value={formatDateLabel(record.updatedAt)} />
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8ca2]">
              Notes
            </p>
            <p className="mt-2 text-sm leading-6 text-[#55657d]">
              {record.notes?.trim() || "Aucune note pour ce dossier."}
            </p>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8ca2]">
              Documents
            </p>

            {record.documents.length === 0 ? (
              <p className="mt-2 text-sm text-[#70819a]">
                Aucun document ajoute pour ce bien.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {record.documents.map((document) => (
                  <DocumentRow key={document.id} document={document} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#e7edf5] bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7d8ca2]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[#172033]">{value}</p>
    </div>
  );
}

function DocumentRow({ document }: { document: ProspectPropertyDocument }) {
  return (
    <a
      href={document.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-3 rounded-[12px] border border-[#e7edf5] bg-white px-4 py-3 transition hover:border-[#c5d3e6] hover:bg-[#fdfefe]"
    >
      <div>
        <p className="text-sm font-semibold text-[#172033]">{document.name}</p>
        <p className="mt-1 text-xs text-[#70819a]">
          {documentTypeLabels[document.type] ?? document.type} • {formatDateLabel(document.uploadedAt)}
        </p>
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2c1a0e]">
        Voir
      </span>
    </a>
  );
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateLabel(value: string) {
  if (!value) {
    return "Non renseigne";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(date);
}

function formatRelationStatus(status: ProspectPropertyRelationStatus) {
  switch (status) {
    case "FAVORITE":
      return "Favori";
    case "NEGOTIATING":
      return "En negociation";
    case "BOUGHT":
      return "Achete";
    case "RENTED":
      return "Loue";
    default:
      return status;
  }
}
