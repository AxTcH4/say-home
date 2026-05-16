"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MoreHorizontal, PencilLine, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { propertyService } from "@/features/properties/services/propertyService";
import { prospectService } from "../services/prospect.service";
import type {
  CreateProspectPropertyInteractionPayload,
  ProspectDetail,
  ProspectPropertyDocument,
  ProspectPropertyDocumentType,
  ProspectPropertyInteraction,
  ProspectPropertyInteractionType,
  ProspectPropertyRecord,
  ProspectPropertyRelationStatus,
  UpdateProspectPropertyPayload,
} from "../types/prospect.types";

const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api";

interface ProspectDetailTabsProps {
  prospect: ProspectDetail;
}

interface PropertyOption {
  id: number;
  title: string;
  type?: string | null;
  secteur?: string | null;
  price?: number | null;
  status?: string | null;
}

type TabKey = "info" | "properties" | "interactions" | "meetings" | "feedback";

const tabs: { key: TabKey; label: string }[] = [
  { key: "info", label: "Info" },
  { key: "properties", label: "Biens" },
  { key: "interactions", label: "Interactions" },
  { key: "meetings", label: "Meetings" },
  { key: "feedback", label: "Feedback" },
];

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

const temperatureStyles = {
  HOT: "bg-[#ecfdf5] text-[#047857]",
  WARM: "bg-[#fff7ed] text-[#c2410c]",
  COLD: "bg-[#eff6ff] text-[#1d4ed8]",
} as const;

const documentTypeLabels: Record<string, string> = {
  BEFORE_SALE_DOCUMENT: "Document avant vente",
  BEFORE_RENTAL_DOCUMENT: "Document avant location",
  SALE_DEED: "Acte de vente",
  LAND_TITLE: "Titre foncier",
  MORTGAGE_CONTRACT: "Contrat de credit immobilier",
  PAYMENT_RECEIPT: "Recu de paiement",
  LEASE_CONTRACT: "Contrat de bail",
  RENT_RECEIPT: "Quittance de loyer",
  PROPERTY_INSPECTION_REPORT: "Etat des lieux",
  SECURITY_DEPOSIT_RECEIPT: "Recu de caution",
  RECEIPT: "Recu",
  CONTRACT: "Contrat",
  PAYMENT_PROOF: "Preuve de paiement",
  ID_COPY: "Copie d'identite",
  OTHER: "Autre",
};

const interactionTypeOptions: ProspectPropertyInteractionType[] = [
  "FAVORITED",
  "VISIT_REQUESTED",
  "VISIT_COMPLETED",
  "NEGOTIATION_STARTED",
  "NEGOTIATION_CANCELLED",
  "PURCHASE_COMPLETED",
  "RENT_COMPLETED",
  "NOTE_ADDED",
];

export function ProspectDetailTabs({ prospect }: ProspectDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [prospectState, setProspectState] = useState(prospect);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [refreshingProspect, setRefreshingProspect] = useState(false);
  const [assigningProperty, setAssigningProperty] = useState(false);
  const [assignForm, setAssignForm] = useState({
    propertyId: "",
    status: "FAVORITE" as ProspectPropertyRelationStatus,
    finalPrice: "",
    notes: "",
    documentFile: null as File | null,
  });

  useEffect(() => {
    setProspectState(prospect);
  }, [prospect]);

  useEffect(() => {
    if (activeTab !== "properties" || properties.length > 0) {
      return;
    }

    void loadProperties();
  }, [activeTab, properties.length]);

  const assignedPropertyIds = useMemo(
    () => new Set(prospectState.propertyRecords.map((record) => record.propertyId)),
    [prospectState.propertyRecords],
  );

  const assignableProperties = useMemo(
    () => properties.filter((property) => !assignedPropertyIds.has(property.id)),
    [assignedPropertyIds, properties],
  );

  async function loadProperties() {
    setLoadingProperties(true);
    try {
      const result = await propertyService.getAll();
      setProperties((result.data ?? []) as PropertyOption[]);
    } catch {
      toast.error("Impossible de charger la liste des biens.");
    } finally {
      setLoadingProperties(false);
    }
  }

  async function refreshProspect() {
    setRefreshingProspect(true);
    try {
      const updatedProspect = await prospectService.getProspectById(prospectState.id);
      setProspectState(updatedProspect);
    } catch {
      toast.error("Impossible de rafraichir le dossier prospect.");
    } finally {
      setRefreshingProspect(false);
    }
  }

  async function handleAssignProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!assignForm.propertyId) {
      toast.error("Selectionne un bien a affecter.");
      return;
    }

    const needsClosingFlow =
      assignForm.status === "BOUGHT" || assignForm.status === "RENTED";

    if (needsClosingFlow && !assignForm.documentFile) {
      toast.error("Ajoute un document avant de finaliser l'affectation.");
      return;
    }

    setAssigningProperty(true);
    try {
      const createdRecord = await prospectService.assignProperty({
        prospectId: prospectState.id,
        propertyId: Number(assignForm.propertyId),
        status: needsClosingFlow ? "NEGOTIATING" : assignForm.status,
        finalPrice: assignForm.finalPrice ? Number(assignForm.finalPrice) : null,
        notes: assignForm.notes.trim() || null,
      });

      if (assignForm.documentFile) {
        const preDocumentType =
          assignForm.status === "BOUGHT"
            ? "BEFORE_SALE_DOCUMENT"
            : "BEFORE_RENTAL_DOCUMENT";
        await prospectService.uploadPropertyDocuments(
          createdRecord.id,
          preDocumentType,
          [assignForm.documentFile],
        );
      }

      if (needsClosingFlow) {
        await prospectService.updatePropertyRecord(createdRecord.id, {
          status: assignForm.status,
          finalPrice: assignForm.finalPrice ? Number(assignForm.finalPrice) : null,
          notes: assignForm.notes.trim() || null,
        });
      }

      toast.success(
        needsClosingFlow
          ? "Affectation finalisee et document genere."
          : "Bien affecte au prospect.",
      );
      setAssignForm({
        propertyId: "",
        status: "FAVORITE",
        finalPrice: "",
        notes: "",
        documentFile: null,
      });
      await refreshProspect();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Impossible d'affecter le bien.",
      );
    } finally {
      setAssigningProperty(false);
    }
  }

  async function handleUpdateRecord(
    recordId: number,
    payload: UpdateProspectPropertyPayload,
  ) {
    try {
      await prospectService.updatePropertyRecord(recordId, payload);
      toast.success("Dossier bien mis a jour.");
      await refreshProspect();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de mettre a jour le dossier.",
      );
    }
  }

  async function handleDeleteRecord(recordId: number, propertyTitle: string) {
    const confirmed = window.confirm(
      `Supprimer le dossier "${propertyTitle}" pour ce prospect ?`,
    );
    if (!confirmed) {
      return;
    }

    try {
      await prospectService.deletePropertyRecord(recordId);
      toast.success("Dossier bien supprime.");
      await refreshProspect();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer le dossier.",
      );
    }
  }

  async function handleAddPropertyInteraction(
    recordId: number,
    payload: CreateProspectPropertyInteractionPayload,
  ) {
    try {
      await prospectService.addPropertyInteraction(recordId, payload);
      toast.success("Interaction ajoutee au dossier.");
      await refreshProspect();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d'ajouter l'interaction.",
      );
    }
  }

  async function handleUploadPropertyDocuments(
    recordId: number,
    type: ProspectPropertyDocumentType,
    files: File[],
  ) {
    try {
      await prospectService.uploadPropertyDocuments(recordId, type, files);
      toast.success("Document ajoute au dossier.");
      await refreshProspect();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d'ajouter le document.",
      );
    }
  }

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
            <InfoCard label="Project Type" value={prospectState.projectType} />
            <InfoCard label="Created At" value={prospectState.createdAt} />
            <div className="md:col-span-2">
              <InfoCard label="General Notes" value={prospectState.notes} />
            </div>
          </div>
        )}

        {activeTab === "interactions" && (
          <InteractionInsightsPanel prospect={prospectState} />
        )}

        {activeTab === "meetings" && (
          <DataList
            emptyText="No meetings scheduled yet."
            items={prospectState.meetings.map((meeting) => ({
              id: meeting.id,
              title: `${meeting.type} - ${meeting.date} at ${meeting.time}`,
              subtitle: `Status: ${meeting.status}`,
              detail: meeting.propertyTitle ? `Bien: ${meeting.propertyTitle}` : "",
            }))}
          />
        )}

        {activeTab === "feedback" && (
          <DataList
            emptyText="No feedback yet."
            items={prospectState.feedback.map((feedback) => ({
              id: feedback.id,
              title: `${feedback.satisfaction} - ${feedback.date}`,
              subtitle: feedback.comment,
            }))}
          />
        )}

        {activeTab === "properties" && (
          <PropertyPortfolio
            records={prospectState.propertyRecords}
            properties={assignableProperties}
            assignForm={assignForm}
            assigningProperty={assigningProperty}
            loadingProperties={loadingProperties}
            refreshingProspect={refreshingProspect}
            onAssignFormChange={setAssignForm}
            onAssignProperty={handleAssignProperty}
            onUpdateRecord={handleUpdateRecord}
            onAddInteraction={handleAddPropertyInteraction}
            onUploadDocuments={handleUploadPropertyDocuments}
            onDeleteRecord={handleDeleteRecord}
          />
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
  items: { id: number; title: string; subtitle: string; detail?: string }[];
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
          {item.detail ? (
            <p className="mt-1 text-xs text-[#7d8ca2]">{item.detail}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function InteractionInsightsPanel({ prospect }: { prospect: ProspectDetail }) {
  const metrics = prospect.leadScoreMetrics;

  return (
    <div className="space-y-5">
      <div className="rounded-[16px] border border-[#e7edf5] bg-[#fbfcfe] px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8ca2]">
              Synthese du modele
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[#172033]">
              Score IA: {metrics.score}/100
            </h3>
            <p className="mt-1 text-sm text-[#61728b]">
              Classification actuelle: {formatTemperature(metrics.classification)}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${temperatureStyles[metrics.classification]}`}
          >
            {metrics.classification}
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Metric label="Interactions" value={String(metrics.totalInteractions)} />
          <Metric label="Biens lies" value={String(metrics.propertyRelations)} />
          <Metric label="Favoris" value={String(metrics.favoriteCount)} />
          <Metric label="RDV confirmes" value={String(metrics.confirmedMeetings)} />
          <Metric label="Negociations" value={String(metrics.negotiationCount)} />
          <Metric label="Messages" value={String(metrics.messagesCount)} />
          <Metric label="Tous les RDV" value={String(metrics.totalMeetings)} />
          <Metric label="Dossiers complets" value={String(metrics.completeDossierCount)} />
          <Metric
            label="Budget"
            value={metrics.budget ? formatAmount(metrics.budget) : "Non renseigne"}
          />
          <Metric
            label="Ecart budget/prix"
            value={metrics.budgetGap ? formatAmount(metrics.budgetGap) : "0 MAD"}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8ca2]">
            Interactions par bien
          </p>
          <p className="mt-1 text-sm text-[#70819a]">
            Clique sur details pour voir les compteurs lies a chaque propriete.
          </p>
        </div>

        {prospect.propertyInsights.length === 0 ? (
          <p className="text-sm text-[#70819a]">
            Aucun bien lie a ce prospect pour le moment.
          </p>
        ) : (
          <div className="space-y-3">
            {prospect.propertyInsights.map((insight) => (
              <details
                key={insight.propertyId}
                className="rounded-[14px] border border-[#e7edf5] bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#172033]">
                      {insight.propertyTitle}
                    </p>
                    <p className="mt-1 text-xs text-[#70819a]">
                      Statut: {formatRelationStatus(insight.relationStatus)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#f6f8fc] px-3 py-1 text-xs font-semibold text-[#61728b]">
                      {insight.totalInteractions} interactions
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2c1a0e]">
                      Details
                    </span>
                  </div>
                </summary>

                <div className="border-t border-[#edf2f8] px-4 py-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric label="Favoris" value={String(insight.favoriteCount)} />
                    <Metric label="Demandes de visite" value={String(insight.visitRequestedCount)} />
                    <Metric label="Visites effectuees" value={String(insight.visitCompletedCount)} />
                    <Metric label="Negociations" value={String(insight.negotiationCount)} />
                    <Metric label="Documents" value={String(insight.documentCount)} />
                    <Metric label="RDV en attente" value={String(insight.requestMeetingsCount)} />
                    <Metric label="RDV confirmes" value={String(insight.confirmedMeetingsCount)} />
                    <Metric label="RDV termines" value={String(insight.completedMeetingsCount)} />
                  </div>
                  <p className="mt-4 text-xs text-[#7d8ca2]">
                    Derniere activite: {formatDateLabel(insight.lastUpdatedAt)}
                  </p>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[16px] border border-[#e7edf5] bg-[#fbfcfe] px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8ca2]">
          Historique global du prospect
        </p>
        <div className="mt-4">
          <DataList
            emptyText="No interactions yet."
            items={prospect.interactions.map((interaction) => ({
              id: interaction.id,
              title: `${interaction.type} - ${interaction.date}`,
              subtitle: interaction.comment,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

function PropertyPortfolio({
  records,
  properties,
  assignForm,
  assigningProperty,
  loadingProperties,
  refreshingProspect,
  onAssignFormChange,
  onAssignProperty,
  onUpdateRecord,
  onAddInteraction,
  onUploadDocuments,
  onDeleteRecord,
}: {
  records: ProspectPropertyRecord[];
  properties: PropertyOption[];
  assignForm: {
    propertyId: string;
    status: ProspectPropertyRelationStatus;
    finalPrice: string;
    notes: string;
    documentFile: File | null;
  };
  assigningProperty: boolean;
  loadingProperties: boolean;
  refreshingProspect: boolean;
  onAssignFormChange: Dispatch<
    SetStateAction<{
      propertyId: string;
      status: ProspectPropertyRelationStatus;
      finalPrice: string;
      notes: string;
      documentFile: File | null;
    }>
  >;
  onAssignProperty: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onUpdateRecord: (
    recordId: number,
    payload: UpdateProspectPropertyPayload,
  ) => Promise<void>;
  onAddInteraction: (
    recordId: number,
    payload: CreateProspectPropertyInteractionPayload,
  ) => Promise<void>;
  onUploadDocuments: (
    recordId: number,
    type: ProspectPropertyDocumentType,
    files: File[],
  ) => Promise<void>;
  onDeleteRecord: (recordId: number, propertyTitle: string) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[18px] border border-[#e7edf5] bg-[#fbfcfe] px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[#172033]">
              Affecter un bien au prospect
            </h3>
            <p className="mt-1 text-sm text-[#70819a]">
              Ajoute un bien au dossier commercial puis fais evoluer son statut.
            </p>
          </div>
          {refreshingProspect && (
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8ca2]">
              Rafraichissement...
            </span>
          )}
        </div>

        <form onSubmit={onAssignProperty} className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm text-[#55657d]">
            <span className="block font-medium text-[#172033]">Bien</span>
            <select
              value={assignForm.propertyId}
              onChange={(event) =>
                onAssignFormChange((current) => ({
                  ...current,
                  propertyId: event.target.value,
                }))
              }
              className="w-full rounded-[12px] border border-[#dbe5f0] bg-white px-3 py-3 text-sm text-[#172033] outline-none transition focus:border-[#2c1a0e]"
            >
              <option value="">
                {loadingProperties
                  ? "Chargement des biens..."
                  : properties.length === 0
                    ? "Aucun bien disponible"
                    : "Selectionner un bien"}
              </option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title} - {property.secteur || "Secteur non precise"}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-[#55657d]">
            <span className="block font-medium text-[#172033]">Statut initial</span>
            <select
              value={assignForm.status}
              onChange={(event) =>
                onAssignFormChange((current) => ({
                  ...current,
                  status: event.target.value as ProspectPropertyRelationStatus,
                }))
              }
              className="w-full rounded-[12px] border border-[#dbe5f0] bg-white px-3 py-3 text-sm text-[#172033] outline-none transition focus:border-[#2c1a0e]"
            >
              {propertySections.map((section) => (
                <option key={section.key} value={section.key}>
                  {section.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-[#55657d]">
            <span className="block font-medium text-[#172033]">Prix final</span>
            <input
              type="number"
              min="0"
              value={assignForm.finalPrice}
              onChange={(event) =>
                onAssignFormChange((current) => ({
                  ...current,
                  finalPrice: event.target.value,
                }))
              }
              placeholder="Ex: 650000"
              className="w-full rounded-[12px] border border-[#dbe5f0] bg-white px-3 py-3 text-sm text-[#172033] outline-none transition focus:border-[#2c1a0e]"
            />
          </label>

          <label className="space-y-2 text-sm text-[#55657d] lg:col-span-2">
            <span className="block font-medium text-[#172033]">Notes</span>
            <textarea
              rows={3}
              value={assignForm.notes}
              onChange={(event) =>
                onAssignFormChange((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              placeholder="Contexte commercial, conditions, infos utiles..."
              className="w-full resize-none rounded-[12px] border border-[#dbe5f0] bg-white px-3 py-3 text-sm text-[#172033] outline-none transition focus:border-[#2c1a0e]"
            />
          </label>

          <label className="space-y-2 text-sm text-[#55657d]">
            <span className="block font-medium text-[#172033]">Document PDF avant affectation</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) =>
                onAssignFormChange((current) => ({
                  ...current,
                  documentFile: event.target.files?.[0] ?? null,
                }))
              }
              className="w-full rounded-[12px] border border-[#dbe5f0] bg-white px-3 py-2.5 text-sm text-[#172033] outline-none transition file:mr-4 file:rounded-[10px] file:border-0 file:bg-[#2c1a0e] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            <span className="block text-xs text-[#70819a]">
              PDF uniquement. Requis pour achat ou location.
            </span>
          </label>

          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={assigningProperty || loadingProperties || properties.length === 0}
              className="rounded-[12px] bg-[#2c1a0e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3b2415] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {assigningProperty ? "Affectation..." : "Affecter le bien"}
            </button>
          </div>
        </form>
      </section>

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
                  {sectionItems.length} dossier{sectionItems.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {sectionItems.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-[#d9e2ef] bg-[#fbfcfe] px-4 py-5 text-sm text-[#70819a]">
                {section.emptyText}
              </div>
            ) : (
              <div className="grid gap-4">
                {sectionItems.map((record) => (
                  <PropertyRecordCard
                    key={record.id}
                    record={record}
                    onUpdateRecord={onUpdateRecord}
                    onAddInteraction={onAddInteraction}
                    onUploadDocuments={onUploadDocuments}
                    onDeleteRecord={onDeleteRecord}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function PropertyRecordCard({
  record,
  onUpdateRecord,
  onAddInteraction,
  onUploadDocuments,
  onDeleteRecord,
}: {
  record: ProspectPropertyRecord;
  onUpdateRecord: (
    recordId: number,
    payload: UpdateProspectPropertyPayload,
  ) => Promise<void>;
  onAddInteraction: (
    recordId: number,
    payload: CreateProspectPropertyInteractionPayload,
  ) => Promise<void>;
  onUploadDocuments: (
    recordId: number,
    type: ProspectPropertyDocumentType,
    files: File[],
  ) => Promise<void>;
  onDeleteRecord: (recordId: number, propertyTitle: string) => Promise<void>;
}) {
  const cover = record.medias[0] ?? "/placeholder.jpg";
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [savingInteraction, setSavingInteraction] = useState(false);
  const [editForm, setEditForm] = useState({
    status: record.relationStatus,
    finalPrice: record.finalPrice ? String(record.finalPrice) : "",
    notes: record.notes ?? "",
  });
  const [interactionForm, setInteractionForm] = useState({
    type: "NOTE_ADDED" as ProspectPropertyInteractionType,
    comment: "",
  });
  const [uploadForm, setUploadForm] = useState({
    type: "BEFORE_SALE_DOCUMENT" as ProspectPropertyDocumentType,
    file: null as File | null,
  });
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    setEditForm({
      status: record.relationStatus,
      finalPrice: record.finalPrice ? String(record.finalPrice) : "",
      notes: record.notes ?? "",
    });
  }, [record.finalPrice, record.notes, record.relationStatus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSubmitRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingRecord(true);
    try {
      await onUpdateRecord(record.id, {
        status: editForm.status,
        finalPrice: editForm.finalPrice ? Number(editForm.finalPrice) : null,
        notes: editForm.notes.trim() || null,
      });
      setIsEditing(false);
    } finally {
      setSavingRecord(false);
    }
  }

  async function handleSubmitInteraction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!interactionForm.comment.trim()) {
      toast.error("Ajoute un commentaire pour tracer l'interaction.");
      return;
    }

    setSavingInteraction(true);
    try {
      await onAddInteraction(record.id, {
        type: interactionForm.type,
        comment: interactionForm.comment.trim(),
      });
      setInteractionForm({
        type: "NOTE_ADDED",
        comment: "",
      });
    } finally {
      setSavingInteraction(false);
    }
  }

  async function handleSubmitDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!uploadForm.file) {
      toast.error("Ajoute un fichier avant l'envoi.");
      return;
    }

    setUploadingDocument(true);
    try {
      await onUploadDocuments(record.id, uploadForm.type, [uploadForm.file]);
      setUploadForm({
        type: "BEFORE_SALE_DOCUMENT",
        file: null,
      });
    } finally {
      setUploadingDocument(false);
    }
  }

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
                {record.propertyType || "Bien"} -{" "}
                {record.propertySector || "Secteur non precise"}
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

          <div className="mt-3 flex justify-end">
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e7edf5] bg-white text-[#61728b] transition hover:border-[#d0d9e5] hover:text-[#172033]"
                aria-label={`Actions pour ${record.propertyTitle}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-12 z-20 w-40 rounded-[16px] border border-[#e7edf5] bg-white p-2 shadow-[0_18px_35px_rgba(20,32,60,0.16)]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-[#172033] transition hover:bg-[#f7f9fc]"
                  >
                    <PencilLine className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      void onDeleteRecord(record.id, record.propertyTitle);
                    }}
                    className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-[#a83939] transition hover:bg-[#fff3f3]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Prix affiche" value={formatAmount(record.propertyPrice)} />
            <Metric
              label="Prix final"
              value={record.finalPrice ? formatAmount(record.finalPrice) : "Non renseigne"}
            />
            <Metric label="Statut du bien" value={record.propertyStatus} />
            <Metric label="Derniere mise a jour" value={formatDateLabel(record.updatedAt)} />
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmitRecord} className="mt-5 grid gap-3 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-[#55657d]">
                <span className="block font-medium text-[#172033]">Statut du dossier</span>
                <select
                  value={editForm.status}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      status: event.target.value as ProspectPropertyRelationStatus,
                    }))
                  }
                  className="w-full rounded-[12px] border border-[#dbe5f0] bg-white px-3 py-3 text-sm text-[#172033] outline-none transition focus:border-[#2c1a0e]"
                >
                  {propertySections.map((section) => (
                    <option key={section.key} value={section.key}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-[#55657d]">
                <span className="block font-medium text-[#172033]">Prix final</span>
                <input
                  type="number"
                  min="0"
                  value={editForm.finalPrice}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      finalPrice: event.target.value,
                    }))
                  }
                  className="w-full rounded-[12px] border border-[#dbe5f0] bg-white px-3 py-3 text-sm text-[#172033] outline-none transition focus:border-[#2c1a0e]"
                />
              </label>

              <label className="space-y-2 text-sm text-[#55657d] lg:col-span-2">
                <span className="block font-medium text-[#172033]">Notes</span>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  className="w-full resize-none rounded-[12px] border border-[#dbe5f0] bg-white px-3 py-3 text-sm text-[#172033] outline-none transition focus:border-[#2c1a0e]"
                />
              </label>

              <div className="flex gap-3 lg:col-span-2">
                <button
                  type="submit"
                  disabled={savingRecord}
                  className="rounded-[12px] border border-[#2c1a0e] px-4 py-2 text-sm font-semibold text-[#2c1a0e] transition hover:bg-[#f8f2ed] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingRecord ? "Mise a jour..." : "Enregistrer"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-[12px] border border-[#dbe5f0] px-4 py-2 text-sm font-semibold text-[#61728b] transition hover:bg-white"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : null}

          <div className="mt-5">
            {record.expectedDocuments.length > 0 ? (
              <div className="mb-5 rounded-[14px] border border-[#e7edf5] bg-white px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8ca2]">
                  Documents attendus
                </p>
                <p className="mt-1 text-sm text-[#70819a]">
                  Modele des documents a preparer pour ce dossier.
                </p>
                <div className="mt-4 space-y-3">
                  {record.expectedDocuments.map((document) => (
                    <ExpectedDocumentRow key={document.type} document={document} />
                  ))}
                </div>
              </div>
            ) : null}

            <form
              onSubmit={handleSubmitDocument}
              className="mb-5 grid gap-3 rounded-[14px] border border-[#e7edf5] bg-white px-4 py-4 lg:grid-cols-[220px_minmax(0,1fr)_auto]"
            >
              <label className="space-y-2 text-sm text-[#55657d]">
                <span className="block font-medium text-[#172033]">Type du document PDF</span>
                <select
                  value={uploadForm.type}
                  onChange={(event) =>
                    setUploadForm((current) => ({
                      ...current,
                      type: event.target.value as ProspectPropertyDocumentType,
                    }))
                  }
                  className="w-full rounded-[12px] border border-[#dbe5f0] bg-white px-3 py-3 text-sm text-[#172033] outline-none transition focus:border-[#2c1a0e]"
                >
                  {["BEFORE_SALE_DOCUMENT", "BEFORE_RENTAL_DOCUMENT"].map((type) => (
                    <option key={type} value={type}>
                      {documentTypeLabels[type]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-[#55657d]">
                <span className="block font-medium text-[#172033]">Fichier</span>
                  <input
                    type="file"
                  accept=".pdf,application/pdf"
                    onChange={(event) =>
                    setUploadForm((current) => ({
                      ...current,
                      file: event.target.files?.[0] ?? null,
                    }))
                  }
                  className="w-full rounded-[12px] border border-[#dbe5f0] bg-white px-3 py-2.5 text-sm text-[#172033] outline-none transition file:mr-4 file:rounded-[10px] file:border-0 file:bg-[#2c1a0e] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={uploadingDocument}
                  className="rounded-[12px] bg-[#172033] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#243146] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadingDocument ? "Envoi..." : "Ajouter le document"}
                </button>
              </div>
            </form>

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

          <div className="mt-5 rounded-[14px] border border-[#e7edf5] bg-white px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8ca2]">
                  Interactions du dossier
                </p>
                <p className="mt-1 text-sm text-[#70819a]">
                  Historique des actions realisees sur ce bien.
                </p>
              </div>
            </div>

            {record.interactions.length === 0 ? (
              <p className="mt-3 text-sm text-[#70819a]">
                Aucune interaction enregistree pour le moment.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {record.interactions.map((interaction) => (
                  <InteractionRow key={interaction.id} interaction={interaction} />
                ))}
              </div>
            )}

            <form
              onSubmit={handleSubmitInteraction}
              className="mt-4 grid gap-3 lg:grid-cols-[220px,1fr]"
            >
              <label className="space-y-2 text-sm text-[#55657d]">
                <span className="block font-medium text-[#172033]">Type d'action</span>
                <select
                  value={interactionForm.type}
                  onChange={(event) =>
                    setInteractionForm((current) => ({
                      ...current,
                      type: event.target.value as ProspectPropertyInteractionType,
                    }))
                  }
                  className="w-full rounded-[12px] border border-[#dbe5f0] bg-white px-3 py-3 text-sm text-[#172033] outline-none transition focus:border-[#2c1a0e]"
                >
                  {interactionTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {formatInteractionType(type)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-[#55657d]">
                <span className="block font-medium text-[#172033]">Commentaire</span>
                <textarea
                  rows={3}
                  value={interactionForm.comment}
                  onChange={(event) =>
                    setInteractionForm((current) => ({
                      ...current,
                      comment: event.target.value,
                    }))
                  }
                  placeholder="Ex: negociation relancee apres visite."
                  className="w-full resize-none rounded-[12px] border border-[#dbe5f0] bg-white px-3 py-3 text-sm text-[#172033] outline-none transition focus:border-[#2c1a0e]"
                />
              </label>

              <div className="lg:col-span-2">
                <button
                  type="submit"
                  disabled={savingInteraction}
                  className="rounded-[12px] bg-[#172033] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#243146] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingInteraction ? "Ajout..." : "Ajouter une interaction"}
                </button>
              </div>
            </form>
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
  const isPdf = document.name.toLowerCase().endsWith(".pdf");
  const href = document.downloadPath
    ? `${API_BASE_URL}${document.downloadPath.replace("/api", "")}`
    : document.url;

  if (isPdf) {
    return (
      <a
        href={href}
        className="flex items-center justify-between gap-3 rounded-[12px] border border-[#e7edf5] bg-white px-4 py-3 transition hover:border-[#c5d3e6] hover:bg-[#fdfefe]"
      >
        <div>
          <p className="text-sm font-semibold text-[#172033]">{document.name}</p>
          <p className="mt-1 text-xs text-[#70819a]">
            {documentTypeLabels[document.type] ?? document.type} -{" "}
            {formatDateLabel(document.uploadedAt)}
          </p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2c1a0e]">
          Telecharger
        </span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-3 rounded-[12px] border border-[#e7edf5] bg-white px-4 py-3 transition hover:border-[#c5d3e6] hover:bg-[#fdfefe]"
    >
      <div>
        <p className="text-sm font-semibold text-[#172033]">{document.name}</p>
        <p className="mt-1 text-xs text-[#70819a]">
          {documentTypeLabels[document.type] ?? document.type} -{" "}
          {formatDateLabel(document.uploadedAt)}
        </p>
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2c1a0e]">
        Voir
      </span>
    </a>
  );
}

function InteractionRow({
  interaction,
}: {
  interaction: ProspectPropertyInteraction;
}) {
  return (
    <div className="rounded-[12px] border border-[#e7edf5] bg-[#fbfcfe] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#172033]">
          {formatInteractionType(interaction.type)}
        </p>
        <span className="text-xs font-medium text-[#70819a]">
          {formatDateLabel(interaction.createdAt)}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-[#55657d]">{interaction.comment}</p>
    </div>
  );
}

function ExpectedDocumentRow({
  document,
}: {
  document: ProspectPropertyRecord["expectedDocuments"][number];
}) {
  return (
    <details className="rounded-[12px] border border-[#e7edf5] bg-[#fbfcfe]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[#172033]">{document.title}</p>
          <p className="mt-1 text-xs text-[#70819a]">{document.description}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
            document.uploaded
              ? "bg-[#ecfdf5] text-[#047857]"
              : "bg-[#fff7ed] text-[#c2410c]"
          }`}
        >
          {document.uploaded ? "Ajoute" : "Attendu"}
        </span>
      </summary>
      <div className="border-t border-[#e7edf5] px-4 py-4">
        <pre className="whitespace-pre-wrap text-xs leading-6 text-[#55657d]">
          {document.sampleContent}
        </pre>
      </div>
    </details>
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

function formatInteractionType(type: ProspectPropertyInteractionType) {
  switch (type) {
    case "FAVORITED":
      return "Ajout en favori";
    case "VISIT_REQUESTED":
      return "Visite demandee";
    case "VISIT_COMPLETED":
      return "Visite effectuee";
    case "NEGOTIATION_STARTED":
      return "Negociation commencee";
    case "NEGOTIATION_CANCELLED":
      return "Negociation abandonnee";
    case "PURCHASE_COMPLETED":
      return "Achat finalise";
    case "RENT_COMPLETED":
      return "Location finalisee";
    case "DOCUMENT_ADDED":
      return "Document ajoute";
    case "NOTE_ADDED":
      return "Note ajoutee";
    default:
      return type;
  }
}

function formatTemperature(value: "HOT" | "WARM" | "COLD") {
  switch (value) {
    case "HOT":
      return "Chaud";
    case "WARM":
      return "Tiede";
    case "COLD":
      return "Froid";
    default:
      return value;
  }
}
