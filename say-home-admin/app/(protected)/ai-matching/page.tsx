"use client";
import { useState, useEffect } from "react";
import { apiClient } from "@/shared/lib/axios";
import { aiMatchingService } from "@/features/ai-matching/services/aiMatchingService";
import { toast } from "sonner";

// ── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const pct = Math.round((score ?? 0) * 100);
  const color =
    pct >= 90 ? "#22c55e" : pct >= 75 ? "#3b82f6" : pct >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{pct}%</span>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-600",
  CONTACTED: "bg-blue-100 text-blue-600",
  QUALIFIED: "bg-purple-100 text-purple-600",
  NEGOTIATING: "bg-amber-100 text-amber-600",
  CONVERTED: "bg-green-100 text-green-600",
  LOST: "bg-red-100 text-red-600",
};

interface ProspectOption {
  id: number;
  fullName: string;
  budgetLabel: string;
  city: string;
  status: string;
}

export default function AiMatching() {
  const [prospects, setProspects] = useState<ProspectOption[]>([]);
  const [loadingProspects, setLoadingProspects] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState<ProspectOption | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [form, setForm] = useState({
    type: "",
    secteur: "",
    minPrice: "",
    maxPrice: "",
    minSurface: "",
    minRooms: "",
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState<"score" | "price">("score");

  useEffect(() => {
    apiClient
      .get("/prospects")
      .then((res) => {
        const items: any[] = res.data?.data?.items ?? [];
        setProspects(
          items.map((p) => ({
            id: p.id,
            fullName: p.fullName,
            budgetLabel: p.budgetLabel,
            city: p.city,
            status: p.status,
          }))
        );
      })
      .catch(() => toast.error("Impossible de charger les prospects"))
      .finally(() => setLoadingProspects(false));
  }, []);

  const handleProspectChange = async (prospectId: string) => {
    if (!prospectId) {
      setSelectedProspect(null);
      setForm({ type: "", secteur: "", minPrice: "", maxPrice: "", minSurface: "", minRooms: "" });
      return;
    }
    const basic = prospects.find((p) => p.id === parseInt(prospectId)) ?? null;
    setSelectedProspect(basic);
    setLoadingDetail(true);
    try {
      const res = await apiClient.get(`/prospects/${prospectId}`);
      const detail = res.data?.data;
      if (!detail) return;
      const city = (detail.city ?? "").toLowerCase();
      const secteur = ["gueliz", "hivernage", "medina"].includes(city) ? city : "";
      const pt = (detail.projectType ?? "").toLowerCase();
      const type = pt.includes("villa")
        ? "villa"
        : pt.includes("appartement")
        ? "appartement"
        : pt.includes("riad")
        ? "riad"
        : "";
      setForm({
        type,
        secteur,
        minPrice: "",
        maxPrice: detail.budgetValue ? String(detail.budgetValue) : "",
        minSurface: "",
        minRooms: "",
      });
    } catch {
      // keep basic info, clear criteria
    } finally {
      setLoadingDetail(false);
    }
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const params: Record<string, any> = {};
      if (form.type) params.type = form.type;
      if (form.secteur) params.secteur = form.secteur;
      if (form.minPrice) params.minPrice = parseFloat(form.minPrice);
      if (form.maxPrice) params.maxPrice = parseFloat(form.maxPrice);
      if (form.minSurface) params.minSurface = parseFloat(form.minSurface);
      if (form.minRooms) params.minRooms = parseFloat(form.minRooms);
      const res = await aiMatchingService.search(params);
      setResults(res.data ?? []);
    } catch {
      toast.error("Erreur du moteur IA — aucun résultat");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...results].sort((a, b) =>
    sortBy === "score"
      ? (b.score ?? 0) - (a.score ?? 0)
      : (a.property?.price ?? 0) - (b.property?.price ?? 0)
  );

  return (
    <div className="h-full overflow-y-auto pr-1 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-blue-500 text-sm">✦</span>
          <span className="text-[10px] font-bold tracking-widest text-blue-500 uppercase">
            AI Recommendation Engine
          </span>
        </div>
        <h1 className="text-xl font-bold text-[#1a1a1a]">AI Property Matching</h1>
      </div>

      {/* Search panel */}
      <div className="bg-white border border-gray-100 rounded-[3px] shadow-sm p-5">
        <form onSubmit={handleSearch} className="space-y-5">
          {/* Prospect selector */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Prospect</label>
            <select
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E] bg-white disabled:opacity-60"
              onChange={(e) => handleProspectChange(e.target.value)}
              defaultValue=""
              disabled={loadingProspects}
            >
              <option value="" disabled>
                {loadingProspects ? "Loading prospects…" : "— Select a prospect (optional) —"}
              </option>
              {prospects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} · {p.city} · {p.budgetLabel}
                </option>
              ))}
            </select>

            {selectedProspect && (
              <div className="mt-2.5 flex items-center gap-3 px-3 py-2.5 bg-blue-50 rounded border border-blue-100">
                <div className="w-8 h-8 rounded-full bg-[#2C1A0E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {selectedProspect.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a]">{selectedProspect.fullName}</p>
                  <p className="text-xs text-gray-500">{selectedProspect.city} · {selectedProspect.budgetLabel}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[selectedProspect.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {selectedProspect.status}
                </span>
                {loadingDetail && (
                  <span className="w-3.5 h-3.5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                )}
              </div>
            )}
          </div>

          {/* Criteria */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Search Criteria
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Type</label>
                <select value={form.type} onChange={(e) => set("type", e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]">
                  <option value="">All types</option>
                  <option value="villa">Villa</option>
                  <option value="appartement">Appartement</option>
                  <option value="riad">Riad</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Secteur</label>
                <select value={form.secteur} onChange={(e) => set("secteur", e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]">
                  <option value="">All sectors</option>
                  <option value="gueliz">Gueliz</option>
                  <option value="hivernage">Hivernage</option>
                  <option value="medina">Medina</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
                  <input type="number" min={0} value={form.minPrice} onChange={(e) => set("minPrice", e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
                  <input type="number" min={0} value={form.maxPrice} onChange={(e) => set("maxPrice", e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]" placeholder="5 000 000" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Min Surface (m²)</label>
                <input type="number" min={0} value={form.minSurface} onChange={(e) => set("minSurface", e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]" placeholder="50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Min Rooms</label>
                <input type="number" min={0} value={form.minRooms} onChange={(e) => set("minRooms", e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]" placeholder="2" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-[#2C1A0E] text-white text-sm rounded hover:bg-[#3d2416] transition disabled:opacity-60 flex items-center gap-2">
              {loading ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyse en cours…</>
              ) : <>✦ Run AI Match</>}
            </button>
          </div>
        </form>
      </div>

      {/* Results table */}
      {searched && (
        <div className="bg-white border border-gray-100 rounded-[3px] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-[#1a1a1a]">
              {loading ? "Analysing properties…" : (
                <>{results.length} match{results.length !== 1 ? "es" : ""} found
                  {selectedProspect && <span className="text-gray-400 font-normal ml-1">for {selectedProspect.fullName}</span>}
                </>
              )}
            </p>
            {results.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400 mr-1">Sort:</span>
                {(["score", "price"] as const).map((k) => (
                  <button key={k} onClick={() => setSortBy(k)}
                    className={`px-3 py-1 text-xs rounded font-medium transition ${sortBy === k ? "bg-[#2C1A0E] text-white" : "border border-gray-200 text-gray-500 hover:border-[#2C1A0E]"}`}>
                    {k === "score" ? "Match Score" : "Price"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-5 h-3 bg-gray-100 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-2/5" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                  </div>
                  <div className="w-20 h-3 bg-gray-100 rounded" />
                  <div className="w-24 h-3 bg-gray-100 rounded" />
                  <div className="w-16 h-3 bg-gray-100 rounded" />
                  <div className="w-20 h-3 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-sm text-gray-500">No properties match the selected criteria.</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting the filters or expanding the budget range.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[2.5rem_1fr_7rem_9rem_7rem_9rem] gap-3 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>#</span><span>Property</span><span>Sector</span><span>Price</span><span>Details</span><span>Match Score</span>
              </div>
              <div className="divide-y divide-gray-50">
                {sorted.map((r, i) => {
                  const { property, score } = r;
                  const pct = Math.round((score ?? 0) * 100);
                  const scoreBg = pct >= 90 ? "bg-green-100 text-green-700" : pct >= 75 ? "bg-blue-100 text-blue-700" : pct >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
                  return (
                    <div key={i} className="grid grid-cols-[2.5rem_1fr_7rem_9rem_7rem_9rem] gap-3 px-5 py-3.5 items-center hover:bg-gray-50/80 transition-colors">
                      <span className="text-xs text-gray-300 font-mono font-bold">{String(i + 1).padStart(2, "0")}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a1a] truncate">{property.title ?? "—"}</p>
                        <p className="text-xs text-gray-400 capitalize mt-0.5">{property.type ?? "—"}</p>
                      </div>
                      <p className="text-xs text-gray-600 capitalize">{property.secteur ?? "—"}</p>
                      <p className="text-sm font-semibold text-[#2C1A0E] tabular-nums">
                        {property.price != null ? property.price.toLocaleString("fr-MA") : "—"}
                        <span className="text-[10px] font-normal text-gray-400 ml-1">MAD</span>
                      </p>
                      <div className="text-xs text-gray-500 space-y-0.5 tabular-nums">
                        {property.surface != null && <p>{property.surface} m²</p>}
                        {property.rooms != null && <p>{property.rooms} rooms</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <ScoreBar score={score ?? 0} />
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${scoreBg}`}>
                          {pct >= 90 ? "Excellent" : pct >= 75 ? "Good" : pct >= 60 ? "Fair" : "Low"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {!searched && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <span className="text-blue-500 text-xl">✦</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Select a prospect or enter criteria and run the AI engine</p>
          <p className="text-xs text-gray-400 mt-1">Similar properties are included — not just exact matches</p>
        </div>
      )}
    </div>
  );
}
