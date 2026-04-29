"use client";
import { useState } from "react";
import { aiMatchingService } from "@/features/ai-matching/services/aiMatchingService";
import { toast } from "sonner";

// ─── Score badge (circle with color based on %) ───────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 90 ? "#22c55e" : pct >= 75 ? "#3b82f6" : pct >= 60 ? "#f59e0b" : "#ef4444";
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg width={48} height={48} className="-rotate-90">
        <circle cx={24} cy={24} r={r} fill="none" stroke="#e5e7eb" strokeWidth={4} />
        <circle
          cx={24}
          cy={24}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={`${dash} ${circ - dash}`}
        />
      </svg>
      <span className="absolute text-[11px] font-bold" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

// ─── Property Match Card ──────────────────────────────────────────────────────
function MatchCard({ result }: { result: any }) {
  const { property, score } = result;
  const pct = Math.round((score ?? 0) * 100);
  const insight =
    pct >= 90
      ? "Matches 100% of location preferences and includes the requested features."
      : pct >= 75
      ? "Well within budget with high surface area, located in prime district."
      : pct >= 60
      ? "Slightly over-budget but offset by exceptional ROI potential and location."
      : "Best value per m² in the area. Matches essential criteria.";

  return (
    <div className="bg-white border border-gray-100 rounded-[3px] shadow-sm overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative">
        {property.medias && property.medias.length > 0 ? (
          <img
            src={property.medias[0]}
            alt={property.title}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl">
            🏠
          </div>
        )}
        <div className="absolute top-2 right-2">
          <ScoreBadge score={score ?? 0} />
        </div>
        {property.secteur && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
            📍 {property.secteur}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex justify-between items-start">
          <p className="font-semibold text-[#1a1a1a] text-sm leading-snug">{property.title}</p>
          <p className="font-bold text-[#2C1A0E] text-sm whitespace-nowrap ml-2">
            {property.price?.toLocaleString("fr-MA")} MAD
          </p>
        </div>

        <div className="flex gap-3 text-xs text-gray-500">
          {property.surface && <span>{property.surface} m²</span>}
          {property.rooms && <span>• {property.rooms} Rooms</span>}
          {property.type && <span>• {property.type}</span>}
        </div>

        {/* AI Insight */}
        <div className="bg-blue-50 border-l-2 border-blue-400 px-3 py-2 rounded-r text-xs text-gray-700 flex gap-2 items-start">
          <span className="text-blue-500 mt-0.5">✦</span>
          <p>
            <span className="font-semibold text-blue-600">AI Insight: </span>
            {insight}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <button className="flex-1 py-2 text-xs font-semibold bg-[#2C1A0E] text-white rounded hover:bg-[#3d2416] transition">
            View Property Details
          </button>
          <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 transition text-gray-400 hover:text-red-400">
            ♡
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sort bar ─────────────────────────────────────────────────────────────────
type SortKey = "score" | "price" | "date";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AiMatching() {
  const [prospectName, setProspectName] = useState("");
  const [form, setForm] = useState({
    type: "",
    secteur: "",
    minPrice: "",
    maxPrice: "",
    title: "",
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("score");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const params: Record<string, any> = {};
      if (form.title) params.title = form.title;
      if (form.type) params.type = form.type;
      if (form.secteur) params.secteur = form.secteur;
      if (form.minPrice) params.minPrice = parseFloat(form.minPrice);
      if (form.maxPrice) params.maxPrice = parseFloat(form.maxPrice);

      const res = await aiMatchingService.search(params);
      setResults(res.data ?? []);
    } catch {
      toast.error("Aucun résultat ou erreur du moteur IA");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...results].sort((a, b) => {
    if (sortBy === "score") return (b.score ?? 0) - (a.score ?? 0);
    if (sortBy === "price") return (a.property?.price ?? 0) - (b.property?.price ?? 0);
    return 0;
  });

  return (
    <div className="h-full overflow-y-auto pr-1">
      {/* ── Search Panel ── */}
      <div className="bg-white border border-gray-100 rounded-[3px] shadow-sm p-5 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-blue-500 text-sm">✦</span>
          <p className="text-[10px] font-bold tracking-widest text-blue-500 uppercase">AI Recommendation Engine</p>
        </div>
        <h1 className="text-xl font-bold text-[#1a1a1a] mb-4">
          {searched && prospectName
            ? `AI-Recommended Properties for ${prospectName}`
            : "AI Property Matching"}
        </h1>

        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          {/* Prospect name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nom du prospect</label>
              <input
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                placeholder="Jean Dupont"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Recherche par titre</label>
              <input
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                placeholder="Loft, Villa…"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
              >
                <option value="">Tous</option>
                <option value="villa">Villa</option>
                <option value="appartement">Appartement</option>
                <option value="riad">Riad</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Secteur</label>
              <select
                value={form.secteur}
                onChange={(e) => set("secteur", e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
              >
                <option value="">Tous</option>
                <option value="gueliz">Gueliz</option>
                <option value="hivernage">Hivernage</option>
                <option value="medina">Medina</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Prix min (MAD)</label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                placeholder="0"
                value={form.minPrice}
                onChange={(e) => set("minPrice", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Prix max (MAD)</label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#2C1A0E]"
                placeholder="5 000 000"
                value={form.maxPrice}
                onChange={(e) => set("maxPrice", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#2C1A0E] text-white text-sm rounded hover:bg-[#3d2416] transition disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyse en cours…
                </>
              ) : (
                <>✦ Lancer le matching IA</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Results ── */}
      {searched && (
        <>
          {results.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-[#1a1a1a]">{results.length}</span> propriété(s) recommandée(s)
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 text-xs">Sort by:</span>
                {(["score", "price", "date"] as SortKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSortBy(k)}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      sortBy === k
                        ? "bg-[#2C1A0E] text-white"
                        : "border border-gray-200 text-gray-500 hover:border-[#2C1A0E]"
                    }`}
                  >
                    {k === "score" ? "Match Score" : k === "price" ? "Price" : "Date Added"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-[3px] shadow-sm overflow-hidden animate-pulse">
                  <div className="w-full h-40 bg-gray-100" />
                  <div className="p-4 flex flex-col gap-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-10 bg-gray-50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-[3px] p-12 text-center shadow-sm">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-gray-500 text-sm">Aucune propriété ne correspond aux critères saisis.</p>
              <p className="text-gray-400 text-xs mt-1">Essayez d'élargir les filtres de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pb-4">
              {sorted.map((r, i) => (
                <MatchCard key={i} result={r} />
              ))}
            </div>
          )}
        </>
      )}

      {!searched && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">🤖</p>
          <p className="text-gray-500 text-sm">Entrez les critères du prospect ci-dessus</p>
          <p className="text-gray-400 text-xs mt-1">Le moteur IA va classer les propriétés par score de correspondance</p>
        </div>
      )}
    </div>
  );
}
