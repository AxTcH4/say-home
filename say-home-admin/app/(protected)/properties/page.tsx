"use client";

import { useEffect, useRef, useState } from "react";
import { propertyService } from "@/features/properties/services/propertyService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";

const MAX_PROPERTY_IMAGES = 10;

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

function AddPropertyModal({
  onClose,
  onAdded,
  agentName,
}: {
  onClose: () => void;
  onAdded: () => void;
  agentName: string;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    secteur: "",
    price: "",
    surface: "",
    rooms: "",
    status: "AVAILABLE",
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.surface || !form.rooms) {
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
        price: parseFloat(form.price),
        surface: parseInt(form.surface, 10),
        rooms: parseInt(form.rooms, 10),
        status: form.status,
        agentName,
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
    } catch {
      toast.error("Erreur lors de l'ajout");
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

            <div>
              <label className="mb-1 block text-xs text-gray-500">Type</label>
              <select
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="">Selectionner</option>
                <option value="villa">Villa</option>
                <option value="appartement">Appartement</option>
                <option value="riad">Riad</option>
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
                <option value="gueliz">Gueliz</option>
                <option value="hivernage">Hivernage</option>
                <option value="medina">Medina</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Prix (MAD) *</label>
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
                {property.secteur ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Type</p>
              <p className="mt-1 font-medium capitalize text-[#1a1a1a]">
                {property.type ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Price</p>
              <p className="mt-1 font-medium text-[#1a1a1a]">
                {property.price?.toLocaleString("fr-MA")} MAD
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
              <p className="text-gray-400">Status</p>
              <p className="mt-1 font-medium text-[#1a1a1a]">
                {STATUS_LABELS[property.status] ?? property.status}
              </p>
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
    price: String(property.price ?? ""),
    surface: String(property.surface ?? ""),
    rooms: String(property.rooms ?? ""),
    status: property.status ?? "AVAILABLE",
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.surface || !form.rooms) {
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
        price: parseFloat(form.price),
        surface: parseInt(form.surface, 10),
        rooms: parseInt(form.rooms, 10),
        status: form.status,
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
                <option value="villa">Villa</option>
                <option value="appartement">Appartement</option>
                <option value="riad">Riad</option>
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
                <option value="gueliz">Gueliz</option>
                <option value="hivernage">Hivernage</option>
                <option value="medina">Medina</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Prix (MAD) *</label>
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
    } catch {
      toast.error("Erreur lors de la mise a jour des images");
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
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const [imagesProperty, setImagesProperty] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
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
      property.secteur?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || property.type === filterType.toLowerCase();
    const matchSecteur =
      filterSecteur === "All" ||
      property.secteur?.toLowerCase() === filterSecteur.toLowerCase();
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
          agentName={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
        />
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
            <option value="gueliz">Gueliz</option>
            <option value="hivernage">Hivernage</option>
            <option value="medina">Medina</option>
          </select>

          <select
            value={filterType}
            onChange={handleFilterChange(setFilterType)}
            className="rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
          >
            <option value="All">Property Type: All</option>
            <option value="villa">Villa</option>
            <option value="appartement">Appartement</option>
            <option value="riad">Riad</option>
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
                  <td className="px-4 py-3 capitalize text-gray-600">
                    {property.secteur ?? "-"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#1a1a1a]">
                    {property.price?.toLocaleString("fr-MA")} MAD
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
                      >
                        Supprimer
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
