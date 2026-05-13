"use client";

import { useEffect, useRef, useState } from "react";
import { propertyService } from "@/features/properties/services/propertyService";
import { userService } from "@/features/users/services/user.service";
import type { AdminUserItem } from "@/features/users/types/user.types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AxiosError } from "axios";
import { toast } from "sonner";

// <<<<<<< HEAD
const MAX_PROPERTY_IMAGES = 10;
// =======
// ─── Edit Media Modal ─────────────────────────────────────────────────────────
function EditMediaModal({ property, onClose, onUpdated }: { property: any; onClose: () => void; onUpdated: () => void }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    setFiles(selected);
    if (!selected) return;
    const urls = Array.from(selected).map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast.error("Sélectionnez au moins une photo.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) fd.append("files", files[i]);
      await propertyService.addMedia(property.id, fd);
      toast.success("Photos ajoutées avec succès !");
      onUpdated();
      onClose();
    } catch {
      toast.error("Erreur lors de l'upload des photos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[3px] shadow-xl w-[560px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div>
            <p className="font-semibold text-[#1a1a1a]">Photos — {property.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{property.medias?.length ?? 0} photo(s) existante(s)</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Photos existantes */}
          {property.medias && property.medias.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Photos actuelles</p>
              <div className="grid grid-cols-3 gap-2">
                {property.medias.map((url: string, i: number) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`photo-${i}`}
                      className="w-full h-28 object-cover rounded-[2px] border border-gray-100"
                    />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-[#2C1A0E] text-white text-[10px] px-1.5 py-0.5 rounded">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload nouvelles photos */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Ajouter des photos</p>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-[2px] py-8 cursor-pointer hover:border-[#2C1A0E] hover:bg-[#faf8f5] transition"
            >
              <span className="text-3xl">📷</span>
              <p className="text-sm text-gray-500">
                Cliquez ou glissez vos photos ici
              </p>
              <p className="text-xs text-gray-400">JPEG · PNG · WebP · Sélection multiple</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Aperçu des nouvelles photos */}
          {previews.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                Aperçu ({previews.length} photo(s) sélectionnée(s))
              </p>
              <div className="grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`preview-${i}`}
                    className="w-full h-28 object-cover rounded-[2px] border border-[#2C1A0E]/20"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 transition"
            >
              Fermer
            </button>
            <button
              type="button"
              disabled={saving || !files || files.length === 0}
              onClick={handleUpload}
              className="px-5 py-2 text-sm bg-[#2C1A0E] text-white rounded hover:bg-[#3d2416] transition disabled:opacity-50"
            >
              {saving ? "Upload en cours…" : `Ajouter ${previews.length > 0 ? `(${previews.length})` : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  RESERVED: "bg-yellow-100 text-yellow-700",
  SOLD: "bg-gray-200 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  SOLD: "Sold",
};

const PAGE_SIZE = 5;
const PROPERTY_TYPE_OPTIONS = [
  { value: "RIAD", label: "Riad" },
  { value: "VILLA", label: "Villa" },
  { value: "APPARTEMENT", label: "Appartement" },
  { value: "STUDIO", label: "Studio" },
] as const;

const PROPERTY_SECTEUR_OPTIONS = [
  { value: "PALMERAIE", label: "Palmeraie" },
  { value: "TARGA", label: "Targa" },
  { value: "MEDINA", label: "Medina" },
  { value: "ROUTE_D_OURIKA", label: "Route d'Ourika" },
  { value: "AGDAL", label: "Agdal" },
  { value: "HIVERNAGE", label: "Hivernage" },
  { value: "MABROUKA", label: "Mabrouka" },
] as const;

const PROPERTY_OFFER_TYPE_OPTIONS = [
  { value: "SALE", label: "A vendre" },
  { value: "RENT", label: "A louer" },
] as const;

const PROPERTY_OFFER_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  PROPERTY_OFFER_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

const PROPERTY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  PROPERTY_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

const PROPERTY_SECTEUR_LABELS: Record<string, string> = Object.fromEntries(
  PROPERTY_SECTEUR_OPTIONS.map((option) => [option.value, option.label]),
);

PROPERTY_SECTEUR_LABELS.GUELIZ = "Gueliz";

function isVillaOrRiad(type?: string) {
  return type === "VILLA" || type === "RIAD";
}

function isStudio(type?: string) {
  return type === "STUDIO";
}

function AmenityToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2 text-sm text-[#1a1a1a]">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function PropertyAmenitiesSummary({ property }: { property: any }) {
  const amenities = [
    property.climatisation ? "Climatisation" : null,
    isVillaOrRiad(property.type) && property.piscine ? "Piscine" : null,
    isVillaOrRiad(property.type) && property.jardin ? "Jardin" : null,
    !isStudio(property.type) && property.garage ? "Garage" : null,
    property.securite ? "Securite" : null,
    property.systemeDomotiqueComplet ? "Systeme domotique complet" : null,
  ].filter(Boolean);

  if (amenities.length === 0) {
    return <p className="mt-1 text-[#1a1a1a]">Aucun equipement specifique</p>;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {amenities.map((amenity) => (
        <span
          key={String(amenity)}
          className="rounded-full border border-[#e0d7cf] bg-[#faf7f2] px-3 py-1 text-xs font-medium text-[#5f4a3c]"
        >
          {amenity}
        </span>
      ))}
    </div>
  );
}

function AddPropertyModal({
  onClose,
  onAdded,
  agents,
}: {
  onClose: () => void;
  onAdded: () => void;
  agents: AdminUserItem[];
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    secteur: "",
    offerType: "SALE",
    price: "",
    surface: "",
    rooms: "",
    bathrooms: "",
    status: "AVAILABLE",
    climatisation: false,
    piscine: false,
    jardin: false,
    garage: false,
    securite: false,
    systemeDomotiqueComplet: false,
    agentName: "",
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const resolveErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message;
      const nestedError = error.response?.data?.error;

      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }

      if (typeof nestedError === "string" && nestedError.trim().length > 0) {
        return nestedError;
      }
    }

    return fallback;
  };

  const set = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title || !form.type || !form.secteur || !form.price || !form.surface || !form.rooms || !form.bathrooms) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (files && files.length > MAX_PROPERTY_IMAGES) {
      toast.error(`Vous pouvez ajouter jusqu'a ${MAX_PROPERTY_IMAGES} images maximum.`);
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        secteur: form.secteur,
        offerType: form.offerType,
        price: parseFloat(form.price),
        surface: parseInt(form.surface, 10),
        rooms: parseInt(form.rooms, 10),
        bathrooms: parseInt(form.bathrooms, 10),
        status: form.status,
        climatisation: form.climatisation,
        piscine: isVillaOrRiad(form.type) ? form.piscine : false,
        jardin: isVillaOrRiad(form.type) ? form.jardin : false,
        garage: isStudio(form.type) ? false : form.garage,
        securite: form.securite,
        systemeDomotiqueComplet: form.systemeDomotiqueComplet,
        agentName: form.agentName || undefined,
      };

      fd.append(
        "property",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i += 1) {
          fd.append("files", files[i]);
        }
      } else {
        fd.append("files", new Blob([], { type: "image/jpeg" }), "placeholder.jpg");
      }

      await propertyService.create(fd);
      toast.success("Propriete ajoutee avec succes");
      onAdded();
      onClose();
    } catch (error) {
      toast.error(resolveErrorMessage(error, "Erreur lors de l'ajout"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="max-h-[90vh] w-[520px] overflow-y-auto rounded-[3px] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <p className="font-semibold text-[#1a1a1a]">Ajouter une propriete</p>
          <button
            onClick={onClose}
            className="text-xl leading-none text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-gray-500">Titre *</label>
              <input
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Modern Loft"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs text-gray-500">Description</label>
              <textarea
                className="w-full resize-none rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                rows={2}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Description courte"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs text-gray-500">Agent assigne</label>
              <select
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.agentName}
                onChange={(e) => set("agentName", e.target.value)}
              >
                <option value="">Aucun agent pour le moment</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.fullName}>
                    {agent.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Type</label>
              <select
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="">Selectionner</option>
                {PROPERTY_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Type d'offre</label>
              <select
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.offerType}
                onChange={(e) => set("offerType", e.target.value)}
              >
                {PROPERTY_OFFER_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Secteur / Ville</label>
              <select
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.secteur}
                onChange={(e) => set("secteur", e.target.value)}
              >
                <option value="">Selectionner</option>
                {PROPERTY_SECTEUR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">
                {form.offerType === "RENT" ? "Loyer mensuel (MAD) *" : "Prix de vente (MAD) *"}
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="750000"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Surface (m2) *</label>
              <input
                type="number"
                min={0}
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.surface}
                onChange={(e) => set("surface", e.target.value)}
                placeholder="85"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Chambres *</label>
              <input
                type="number"
                min={0}
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.rooms}
                onChange={(e) => set("rooms", e.target.value)}
                placeholder="3"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Salles de bain *</label>
              <input
                type="number"
                min={0}
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.bathrooms}
                onChange={(e) => set("bathrooms", e.target.value)}
                placeholder="2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Statut</label>
              <select
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="mb-2 block text-xs text-gray-500">Equipements</label>
              <div className="grid grid-cols-2 gap-3">
                <AmenityToggle
                  label="Climatisation"
                  checked={form.climatisation}
                  onChange={(checked) => setForm((current) => ({ ...current, climatisation: checked }))}
                />
                <AmenityToggle
                  label="Securite"
                  checked={form.securite}
                  onChange={(checked) => setForm((current) => ({ ...current, securite: checked }))}
                />
                <AmenityToggle
                  label="Systeme domotique complet"
                  checked={form.systemeDomotiqueComplet}
                  onChange={(checked) =>
                    setForm((current) => ({ ...current, systemeDomotiqueComplet: checked }))
                  }
                />
                {!isStudio(form.type) ? (
                  <AmenityToggle
                    label="Garage"
                    checked={form.garage}
                    onChange={(checked) => setForm((current) => ({ ...current, garage: checked }))}
                  />
                ) : null}
                {isVillaOrRiad(form.type) ? (
                  <>
                    <AmenityToggle
                      label="Piscine"
                      checked={form.piscine}
                      onChange={(checked) => setForm((current) => ({ ...current, piscine: checked }))}
                    />
                    <AmenityToggle
                      label="Jardin"
                      checked={form.jardin}
                      onChange={(checked) => setForm((current) => ({ ...current, jardin: checked }))}
                    />
                  </>
                ) : null}
              </div>
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs text-gray-500">Photos</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="text-sm text-gray-500"
              />
              <p className="mt-2 text-xs text-gray-400">
                Jusqu'a 10 images par propriete.
              </p>
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-200 px-5 py-2 text-sm transition hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[#2C1A0E] px-5 py-2 text-sm text-white transition hover:bg-[#3d2416] disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PropertyDetailsModal({
  property,
  onClose,
}: {
  property: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="max-h-[90vh] w-[620px] overflow-y-auto rounded-[3px] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Property details
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#1a1a1a]">
              {property.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-xl leading-none text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {property.medias && property.medias.length > 0 ? (
            <img
              src={property.medias[0]}
              alt={property.title}
              className="h-56 w-full rounded object-cover"
            />
          ) : (
            <div className="flex h-56 w-full items-center justify-center rounded bg-gray-100 text-sm text-gray-400">
              No image available
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">City</p>
              <p className="mt-1 font-medium capitalize text-[#1a1a1a]">
                {PROPERTY_SECTEUR_LABELS[property.secteur] ?? property.secteur ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Type</p>
              <p className="mt-1 font-medium capitalize text-[#1a1a1a]">
                {PROPERTY_TYPE_LABELS[property.type] ?? property.type ?? "-"}
              </p>
            </div>
            <div>
                <p className="text-gray-400">Price</p>
                <p className="mt-1 font-medium text-[#1a1a1a]">
                {property.price?.toLocaleString("fr-MA")} MAD{property.offerType === "RENT" ? " / mois" : ""}
                </p>
              </div>
            <div>
              <p className="text-gray-400">Offre</p>
              <p className="mt-1 font-medium text-[#1a1a1a]">
                {PROPERTY_OFFER_TYPE_LABELS[property.offerType] ?? property.offerType ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Surface</p>
              <p className="mt-1 font-medium text-[#1a1a1a]">
                {property.surface} m2
              </p>
            </div>
            <div>
              <p className="text-gray-400">Rooms</p>
              <p className="mt-1 font-medium text-[#1a1a1a]">{property.rooms}</p>
            </div>
            <div>
              <p className="text-gray-400">Bathrooms</p>
              <p className="mt-1 font-medium text-[#1a1a1a]">{property.bathrooms ?? "-"}</p>
            </div>
            <div>
              <p className="text-gray-400">Status</p>
              <p className="mt-1 font-medium text-[#1a1a1a]">
                {STATUS_LABELS[property.status] ?? property.status}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400">Equipements</p>
              <PropertyAmenitiesSummary property={property} />
            </div>
            <div className="col-span-2">
              <p className="text-gray-400">Agent</p>
              <p className="mt-1 font-medium text-[#1a1a1a]">
                {property.agent?.firstName && property.agent?.lastName
                  ? `${property.agent.firstName} ${property.agent.lastName}`
                  : "-"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400">Description</p>
              <p className="mt-1 leading-6 text-[#1a1a1a]">
                {property.description || "No description"}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-200 px-5 py-2 text-sm transition hover:bg-gray-50"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditPropertyModal({
  property,
  onClose,
  onUpdated,
}: {
  property: any;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: property.title ?? "",
    description: property.description ?? "",
    type: property.type ?? "",
    secteur: property.secteur ?? "",
    offerType: property.offerType ?? "SALE",
    price: String(property.price ?? ""),
    surface: String(property.surface ?? ""),
    rooms: String(property.rooms ?? ""),
    bathrooms: String(property.bathrooms ?? ""),
    status: property.status ?? "AVAILABLE",
    climatisation: Boolean(property.climatisation),
    piscine: Boolean(property.piscine),
    jardin: Boolean(property.jardin),
    garage: Boolean(property.garage),
    securite: Boolean(property.securite),
    systemeDomotiqueComplet: Boolean(property.systemeDomotiqueComplet),
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title || !form.type || !form.secteur || !form.price || !form.surface || !form.rooms || !form.bathrooms) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSaving(true);
    try {
      await propertyService.update(property.id, {
        title: form.title,
        description: form.description,
        type: form.type,
        secteur: form.secteur,
        offerType: form.offerType,
        price: parseFloat(form.price),
        surface: parseInt(form.surface, 10),
        rooms: parseInt(form.rooms, 10),
        bathrooms: parseInt(form.bathrooms, 10),
        status: form.status,
        climatisation: form.climatisation,
        piscine: isVillaOrRiad(form.type) ? form.piscine : false,
        jardin: isVillaOrRiad(form.type) ? form.jardin : false,
        garage: isStudio(form.type) ? false : form.garage,
        securite: form.securite,
        systemeDomotiqueComplet: form.systemeDomotiqueComplet,
      });
      toast.success("Propriete modifiee avec succes");
      await onUpdated();
      onClose();
    } catch {
      toast.error("Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="max-h-[90vh] w-[520px] overflow-y-auto rounded-[3px] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <p className="font-semibold text-[#1a1a1a]">Modifier la propriete</p>
          <button
            onClick={onClose}
            className="text-xl leading-none text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-gray-500">Titre *</label>
              <input
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs text-gray-500">Description</label>
              <textarea
                className="w-full resize-none rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                rows={2}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Type</label>
              <select
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="">Selectionner</option>
                {PROPERTY_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Type d'offre</label>
              <select
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.offerType}
                onChange={(e) => set("offerType", e.target.value)}
              >
                {PROPERTY_OFFER_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Secteur / Ville</label>
              <select
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.secteur}
                onChange={(e) => set("secteur", e.target.value)}
              >
                <option value="">Selectionner</option>
                {PROPERTY_SECTEUR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">
                {form.offerType === "RENT" ? "Loyer mensuel (MAD) *" : "Prix de vente (MAD) *"}
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Surface (m2) *</label>
              <input
                type="number"
                min={0}
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.surface}
                onChange={(e) => set("surface", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Chambres *</label>
              <input
                type="number"
                min={0}
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.rooms}
                onChange={(e) => set("rooms", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Salles de bain *</label>
              <input
                type="number"
                min={0}
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.bathrooms}
                onChange={(e) => set("bathrooms", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Statut</label>
              <select
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="mb-2 block text-xs text-gray-500">Equipements</label>
              <div className="grid grid-cols-2 gap-3">
                <AmenityToggle
                  label="Climatisation"
                  checked={form.climatisation}
                  onChange={(checked) => setForm((current) => ({ ...current, climatisation: checked }))}
                />
                <AmenityToggle
                  label="Securite"
                  checked={form.securite}
                  onChange={(checked) => setForm((current) => ({ ...current, securite: checked }))}
                />
                <AmenityToggle
                  label="Systeme domotique complet"
                  checked={form.systemeDomotiqueComplet}
                  onChange={(checked) =>
                    setForm((current) => ({ ...current, systemeDomotiqueComplet: checked }))
                  }
                />
                {!isStudio(form.type) ? (
                  <AmenityToggle
                    label="Garage"
                    checked={form.garage}
                    onChange={(checked) => setForm((current) => ({ ...current, garage: checked }))}
                  />
                ) : null}
                {isVillaOrRiad(form.type) ? (
                  <>
                    <AmenityToggle
                      label="Piscine"
                      checked={form.piscine}
                      onChange={(checked) => setForm((current) => ({ ...current, piscine: checked }))}
                    />
                    <AmenityToggle
                      label="Jardin"
                      checked={form.jardin}
                      onChange={(checked) => setForm((current) => ({ ...current, jardin: checked }))}
                    />
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-200 px-5 py-2 text-sm transition hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[#2C1A0E] px-5 py-2 text-sm text-white transition hover:bg-[#3d2416] disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PropertyImagesModal({
  property,
  onClose,
  onUpdated,
}: {
  property: any;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);

  const resolveErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message;
      const nestedError = error.response?.data?.error;

      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }

      if (typeof nestedError === "string" && nestedError.trim().length > 0) {
        return nestedError;
      }
    }

    return fallback;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      toast.error("Veuillez choisir au moins une image");
      return;
    }
    if (files.length > MAX_PROPERTY_IMAGES) {
      toast.error(`Vous pouvez ajouter jusqu'a ${MAX_PROPERTY_IMAGES} images maximum.`);
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i += 1) {
        fd.append("files", files[i]);
      }

      await propertyService.replaceImages(property.id, fd);
      toast.success("Images mises a jour avec succes");
      await onUpdated();
      onClose();
    } catch (error) {
      toast.error(resolveErrorMessage(error, "Erreur lors de la mise a jour des images"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="max-h-[90vh] w-[620px] overflow-y-auto rounded-[3px] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Images</p>
            <h2 className="mt-1 text-lg font-semibold text-[#1a1a1a]">{property.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-xl leading-none text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div>
            <p className="mb-3 text-sm font-medium text-[#1a1a1a]">Images actuelles</p>
            {property.medias && property.medias.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {property.medias.map((media: string) => (
                  <img
                    key={media}
                    src={media}
                    alt={property.title}
                    className="h-28 w-full rounded object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="rounded border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
                Aucune image actuellement
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
              Remplacer toutes les images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="text-sm text-gray-500"
            />
            <p className="mt-2 text-xs text-gray-400">
              Cette action remplace les images visibles dans l'application pour cette propriete. Jusqu'a 10 images.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-200 px-5 py-2 text-sm transition hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[#2C1A0E] px-5 py-2 text-sm text-white transition hover:bg-[#3d2416] disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Mettre a jour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Properties() {
  useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [agents, setAgents] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
// <<<<<<< HEAD
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const [imagesProperty, setImagesProperty] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
// =======
  const [editMediaProperty, setEditMediaProperty] = useState<any>(null);
// >>>>>>> f39e34d (matching-ia)
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterSecteur, setFilterSecteur] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await propertyService.getAll();
      setProperties(res.data ?? []);
    } catch {
      toast.error("Erreur lors du chargement des proprietes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await userService.getUsers();
        setAgents(
          res.items.filter((item) => item.role?.toUpperCase?.() === "AGENT"),
        );
      } catch {
        toast.error("Impossible de charger la liste des agents");
      }
    };

    loadAgents();
  }, []);

  const handleView = async (id: number) => {
    setLoadingDetails(true);
    try {
      const res = await propertyService.getById(id);
      setSelectedProperty(res.data ?? null);
    } catch {
      toast.error("Impossible de charger le detail de la propriete");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEdit = (property: any) => {
    setEditingProperty(property);
  };

  const handleImages = (property: any) => {
    setImagesProperty(property);
  };

  const handleDelete = async (property: any) => {
    const confirmed = window.confirm(`Supprimer la propriete "${property.title}" ?`);
    if (!confirmed) {
      return;
    }

    try {
      await propertyService.remove(property.id);
      toast.success("Propriete supprimee avec succes");
      if (selectedProperty?.id === property.id) {
        setSelectedProperty(null);
      }
      if (editingProperty?.id === property.id) {
        setEditingProperty(null);
      }
      if (imagesProperty?.id === property.id) {
        setImagesProperty(null);
      }
      await load();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const filtered = properties.filter((property) => {
    const matchSearch =
      !search ||
      property.title?.toLowerCase().includes(search.toLowerCase()) ||
      PROPERTY_SECTEUR_LABELS[property.secteur]?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || property.type === filterType;
    const matchSecteur =
      filterSecteur === "All" || property.secteur === filterSecteur;
    const matchStatus = filterStatus === "All" || property.status === filterStatus;
    return matchSearch && matchType && matchSecteur && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      setPage(1);
    };

  return (
    <div className="h-full overflow-y-auto pr-1">
      {showModal && (
        <AddPropertyModal
          onClose={() => setShowModal(false)}
          onAdded={load}
          agents={agents}
        />
      )}
      {editMediaProperty && (
        <EditMediaModal property={editMediaProperty} onClose={() => setEditMediaProperty(null)} onUpdated={load} />
      )}

      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
      {editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onUpdated={load}
        />
      )}
      {imagesProperty && (
        <PropertyImagesModal
          property={imagesProperty}
          onClose={() => setImagesProperty(null)}
          onUpdated={load}
        />
      )}

      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Properties Inventory</h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Manage and track your active real estate portfolio
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-[2px] bg-[#2C1A0E] px-5 py-2.5 text-sm text-white transition hover:bg-[#3d2416]"
        >
          <span className="text-base leading-none">+</span> ADD
        </button>
      </div>

      <div className="mb-4 rounded-[3px] border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <input
              type="text"
              placeholder="Search property by name or address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded border border-gray-200 px-3 py-2 pl-8 text-sm outline-none focus:border-[#2C1A0E]"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              Search
            </span>
          </div>

          <select
            value={filterSecteur}
            onChange={handleFilterChange(setFilterSecteur)}
            className="rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
          >
            <option value="All">City: All</option>
            {PROPERTY_SECTEUR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={handleFilterChange(setFilterType)}
            className="rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
          >
            <option value="All">Property Type: All</option>
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={handleFilterChange(setFilterStatus)}
            className="rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
          >
            <option value="All">Status: All</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="SOLD">Sold</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-[3px] border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Surface</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse border-b border-gray-50">
                  <td className="px-4 py-3">
                    <div className="h-9 w-12 rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-32 rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-16 rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-24 rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-12 rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-20 rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-10 rounded bg-gray-100" />
                  </td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                  Aucune propriete trouvee
                </td>
              </tr>
            ) : (
              paginated.map((property: any) => (
                <tr
                  key={property.id}
                  className="border-b border-gray-50 transition hover:bg-[#fafaf9]"
                >
                  <td className="px-4 py-3">
                    {property.medias && property.medias.length > 0 ? (
                      <img
                        src={property.medias[0]}
                        alt={property.title}
                        className="h-10 w-14 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-14 items-center justify-center rounded bg-gray-100 text-xs text-gray-300">
                        IMG
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1a1a1a]">{property.title}</p>
                    <p className="text-xs text-gray-400">
                      ID: PRE-{String(property.id).padStart(4, "0")}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{PROPERTY_SECTEUR_LABELS[property.secteur] ?? property.secteur ?? "-"}</p>
                    <p className="text-xs text-gray-400">
                      {PROPERTY_TYPE_LABELS[property.type] ?? property.type ?? "-"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {PROPERTY_OFFER_TYPE_LABELS[property.offerType] ?? property.offerType ?? "-"}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#1a1a1a]">
                    {property.price?.toLocaleString("fr-MA")} MAD{property.offerType === "RENT" ? " / mois" : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{property.surface} m2</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2.5 py-1 text-xs font-semibold ${
                        STATUS_COLORS[property.status] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {STATUS_LABELS[property.status] ?? property.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        title="Voir"
                        onClick={() => handleView(property.id)}
                        disabled={loadingDetails}
                        className="text-gray-400 transition hover:text-[#2C1A0E] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Voir
                      </button>
                      <button
// <<<<<<< HEAD
                        title="Modifier"
                        onClick={() => handleEdit(property)}
                        className="text-gray-400 transition hover:text-[#2C1A0E]"
                      >
                        Modifier
                      </button>
                      <button
                        title="Images"
                        onClick={() => handleImages(property)}
                        className="text-gray-400 transition hover:text-[#2C1A0E]"
                      >
                        Images
                      </button>
                      <button
                        title="Supprimer"
                        onClick={() => handleDelete(property)}
                        className="text-red-400 transition hover:text-red-700"
                      />
                        Supprimer
{/* ======= */}
                      <button
                        title="Gérer les photos"
                        onClick={() => setEditMediaProperty(p)}
                        className="text-gray-400 hover:text-[#2C1A0E] transition"
                      >
                        🖼️
{/* >>>>>>> f39e34d (matching-ia) */}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm">
            <p className="text-xs text-gray-400">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} to{" "}
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} properties
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-xs text-gray-500 transition hover:border-[#2C1A0E] disabled:cursor-not-allowed disabled:opacity-30"
              >
                {"<"}
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => setPage(number)}
                    className={`flex h-7 w-7 items-center justify-center rounded border text-xs transition ${
                      page === number
                        ? "border-[#2C1A0E] bg-[#2C1A0E] text-white"
                        : "border-gray-200 text-gray-500 hover:border-[#2C1A0E]"
                    }`}
                  >
                    {number}
                  </button>
                ),
              )}
              {totalPages > 5 && <span className="px-1 text-xs text-gray-400">...</span>}
              {totalPages > 5 && (
                <button
                  onClick={() => setPage(totalPages)}
                  className={`flex h-7 w-7 items-center justify-center rounded border text-xs transition ${
                    page === totalPages
                      ? "border-[#2C1A0E] bg-[#2C1A0E] text-white"
                      : "border-gray-200 text-gray-500 hover:border-[#2C1A0E]"
                  }`}
                >
                  {totalPages}
                </button>
              )}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-xs text-gray-500 transition hover:border-[#2C1A0E] disabled:cursor-not-allowed disabled:opacity-30"
              >
                {">"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
