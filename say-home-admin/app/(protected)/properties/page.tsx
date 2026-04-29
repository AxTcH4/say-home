"use client";
import { useEffect, useState, useRef } from "react";
import { propertyService } from "@/features/properties/services/propertyService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";

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

// ─── Add Property Modal ───────────────────────────────────────────────────────
function AddPropertyModal({ onClose, onAdded, agentName }: { onClose: () => void; onAdded: () => void; agentName: string }) {
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

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.surface || !form.rooms) {
      toast.error("Veuillez remplir tous les champs obligatoires");
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
        surface: parseInt(form.surface),
        rooms: parseInt(form.rooms),
        status: form.status,
        agentName: agentName,
      };
      fd.append("property", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) fd.append("files", files[i]);
      } else {
        fd.append("files", new Blob([], { type: "image/jpeg" }), "placeholder.jpg");
      }
      await propertyService.create(fd);
      toast.success("Propriété ajoutée avec succès");
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
      <div className="bg-white rounded-[3px] shadow-xl w-[520px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <p className="font-semibold text-[#1a1a1a]">Ajouter une propriété</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Titre *</label>
              <input
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Modern Loft…"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Description</label>
              <textarea
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E] resize-none"
                rows={2}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Description courte…"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="">Sélectionner</option>
                <option value="villa">Villa</option>
                <option value="appartement">Appartement</option>
                <option value="riad">Riad</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Secteur / Ville</label>
              <select
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.secteur}
                onChange={(e) => set("secteur", e.target.value)}
              >
                <option value="">Sélectionner</option>
                <option value="gueliz">Gueliz</option>
                <option value="hivernage">Hivernage</option>
                <option value="medina">Medina</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Prix (MAD) *</label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="750000"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Surface (m²) *</label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.surface}
                onChange={(e) => set("surface", e.target.value)}
                placeholder="85"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Chambres *</label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.rooms}
                onChange={(e) => set("rooms", e.target.value)}
                placeholder="3"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Statut</label>
              <select
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Photos</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="text-sm text-gray-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm bg-[#2C1A0E] text-white rounded hover:bg-[#3d2416] transition disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Properties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
      toast.error("Erreur lors du chargement des propriétés");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = properties.filter((p) => {
    const matchSearch =
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.secteur?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || p.type === filterType.toLowerCase();
    const matchSecteur = filterSecteur === "All" || p.secteur?.toLowerCase() === filterSecteur.toLowerCase();
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchType && matchSecteur && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <div className="h-full overflow-y-auto pr-1">
      {showModal && (
        <AddPropertyModal onClose={() => setShowModal(false)} onAdded={load} agentName={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`} />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Properties Inventory</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage and track your active real estate portfolio</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2C1A0E] text-white text-sm rounded-[2px] hover:bg-[#3d2416] transition"
        >
          <span className="text-base leading-none">↑</span> ADD
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-[3px] p-4 shadow-sm mb-4">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search property by name or address…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E] pl-8"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          </div>
          <select
            value={filterSecteur}
            onChange={handleFilterChange(setFilterSecteur)}
            className="border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
          >
            <option value="All">City: All</option>
            <option value="gueliz">Gueliz</option>
            <option value="hivernage">Hivernage</option>
            <option value="medina">Medina</option>
          </select>
          <select
            value={filterType}
            onChange={handleFilterChange(setFilterType)}
            className="border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
          >
            <option value="All">Property Type: All</option>
            <option value="villa">Villa</option>
            <option value="appartement">Appartement</option>
            <option value="riad">Riad</option>
          </select>
          <select
            value={filterStatus}
            onChange={handleFilterChange(setFilterStatus)}
            className="border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
          >
            <option value="All">Status: All</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="SOLD">Sold</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-[3px] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Photo</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Surface</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50 animate-pulse">
                  <td className="px-4 py-3"><div className="w-12 h-9 bg-gray-100 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-32" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-16" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-24" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-12" /></td>
                  <td className="px-4 py-3"><div className="h-5 bg-gray-100 rounded w-20" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-10" /></td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                  Aucune propriété trouvée
                </td>
              </tr>
            ) : (
              paginated.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-[#fafaf9] transition">
                  <td className="px-4 py-3">
                    {p.medias && p.medias.length > 0 ? (
                      <img src={p.medias[0]} alt="" className="w-14 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-14 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs">
                        🏠
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1a1a1a]">{p.title}</p>
                    <p className="text-xs text-gray-400">ID: PRE-{String(p.id).padStart(4, "0")}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">{p.secteur ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold text-[#1a1a1a]">
                    {p.price?.toLocaleString("fr-MA")} MAD
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.surface} m²
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded ${
                        STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button title="Voir" className="text-gray-400 hover:text-[#2C1A0E] transition">
                        👁
                      </button>
                      <button title="Modifier" className="text-gray-400 hover:text-[#2C1A0E] transition">
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 text-sm">
            <p className="text-gray-400 text-xs">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} to{" "}
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} properties
            </p>
            <div className="flex gap-1 items-center">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-[#2C1A0E] disabled:opacity-30 disabled:cursor-not-allowed transition text-xs"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 flex items-center justify-center rounded border text-xs transition ${
                    page === n
                      ? "bg-[#2C1A0E] text-white border-[#2C1A0E]"
                      : "border-gray-200 text-gray-500 hover:border-[#2C1A0E]"
                  }`}
                >
                  {n}
                </button>
              ))}
              {totalPages > 5 && <span className="text-gray-400 text-xs px-1">…</span>}
              {totalPages > 5 && (
                <button
                  onClick={() => setPage(totalPages)}
                  className={`w-7 h-7 flex items-center justify-center rounded border text-xs transition ${
                    page === totalPages
                      ? "bg-[#2C1A0E] text-white border-[#2C1A0E]"
                      : "border-gray-200 text-gray-500 hover:border-[#2C1A0E]"
                  }`}
                >
                  {totalPages}
                </button>
              )}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-[#2C1A0E] disabled:opacity-30 disabled:cursor-not-allowed transition text-xs"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
