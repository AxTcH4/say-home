"use client";
import { useEffect, useState } from "react";
import { dashboardService } from "@/features/dashboard/services/dashboardService";
import { calculateTimeAgo } from "@/shared/lib/utils";

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data) || 1;
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 80, H = 32;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`)
    .join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = 52, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={140} height={140}>
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circ;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
            strokeWidth={16} strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

// ─── Monthly Line Chart ───────────────────────────────────────────────────────
function LeadsChart({ thisYear, lastYear }: { thisYear: number[]; lastYear: number[] }) {
  const W = 480, H = 140;
  const pad = { top: 10, right: 16, bottom: 24, left: 24 };
  const w = W - pad.left - pad.right;
  const h = H - pad.top - pad.bottom;
  const maxV = Math.max(...thisYear, ...lastYear, 1);
  const MONTHS = ["JAN", "MAR", "MAY", "JUL", "SEP", "DEC"];

  const pts = (data: number[]) =>
    data.map((v, i) => {
      const x = pad.left + (i / (data.length - 1)) * w;
      const y = pad.top + (1 - v / maxV) * h;
      return `${x},${y}`;
    }).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <polyline points={pts(thisYear)} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />
      <polyline points={pts(lastYear)} fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinejoin="round" strokeDasharray="4 3" />
      {MONTHS.map((m, i) => (
        <text key={m} x={pad.left + ((i * 2.2) / 11) * w} y={H - 4} fontSize="9" fill="#9ca3af" textAnchor="middle">{m}</text>
      ))}
    </svg>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-[3px] p-4 shadow-sm animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-24 mb-3" />
      <div className="h-7 bg-gray-100 rounded w-16 mb-4" />
      <div className="h-8 bg-gray-50 rounded w-20" />
    </div>
  );
}

const AVATAR_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#8b5cf6", "#ef4444"];

const PRIORITY_STYLE: Record<string, string> = {
  URGENT: "bg-red-100 text-red-600",
  HIGH: "bg-orange-100 text-orange-600",
  MEDIUM: "bg-yellow-50 text-yellow-600",
  LOW: "bg-green-50 text-green-600",
};

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  // ── KPI cards config (driven by real data) ────────────────────────────────
  const kpiCards = stats ? [
    {
      label: "Total Prospects",
      value: stats.totalProspects,
      spark: stats.monthlyThisYear?.slice(0, 7) ?? [],
      color: "#3b82f6",
      positive: true,
    },
    {
      label: "Available Properties",
      value: stats.availableProperties,
      spark: stats.monthlyThisYear ?? [],
      color: "#22c55e",
      positive: true,
    },
    {
      label: "Open Tickets",
      value: stats.openTickets,
      spark: Array(7).fill(0).map((_, i) => Math.max(0, (stats.totalTickets ?? 0) - i)),
      color: "#ef4444",
      positive: stats.openTickets === 0,
    },
    {
      label: "Conversion Rate",
      value: `${stats.conversionRate ?? 0}%`,
      spark: [0, 0, 0, stats.soldProperties ?? 0, stats.soldProperties ?? 0],
      color: "#8b5cf6",
      positive: (stats.conversionRate ?? 0) > 0,
    },
  ] : [];

  // ── Pipeline segments (real property status counts) ───────────────────────
  const pipelineTotal = stats
    ? (stats.availableProperties + stats.reservedProperties + stats.soldProperties) || 1
    : 1;

  const pipelineSegments = stats ? [
    { label: "Available", value: stats.availableProperties, color: "#22c55e" },
    { label: "Reserved", value: stats.reservedProperties, color: "#f59e0b" },
    { label: "Sold", value: stats.soldProperties, color: "#3b82f6" },
  ] : [];

  return (
    <div className="h-full overflow-y-auto pr-1">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : kpiCards.map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-[3px] p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-[#1a1a1a]">{s.value}</p>
                </div>
              </div>
              <div className="mt-2">
                <Sparkline data={s.spark.map(Number)} color={s.color} />
              </div>
            </div>
          ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-[1fr_260px] gap-4 mb-5">
        {/* Monthly Properties Chart */}
        <div className="bg-white border border-gray-100 rounded-[3px] p-5 shadow-sm">
          <p className="font-semibold text-sm text-[#1a1a1a]">Monthly Properties Added</p>
          <p className="text-xs text-gray-400 mb-3">Nombre de propriétés créées par mois</p>
          <div className="flex gap-4 text-xs mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-blue-500 inline-block rounded" /> Cette année
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-gray-300 inline-block rounded" /> Année dernière
            </span>
          </div>
          {loading ? (
            <div className="h-[140px] bg-gray-50 rounded animate-pulse" />
          ) : (
            <LeadsChart
              thisYear={stats?.monthlyThisYear ?? Array(12).fill(0)}
              lastYear={stats?.monthlyLastYear ?? Array(12).fill(0)}
            />
          )}
        </div>

        {/* Pipeline Donut */}
        <div className="bg-white border border-gray-100 rounded-[3px] p-5 shadow-sm flex flex-col">
          <p className="font-semibold text-sm text-[#1a1a1a]">Properties by Status</p>
          <p className="text-xs text-gray-400 mb-3">Répartition du portefeuille</p>
          {loading ? (
            <div className="w-[140px] h-[140px] bg-gray-50 rounded-full animate-pulse mx-auto" />
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative">
                <DonutChart segments={pipelineSegments} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{stats?.totalProperties ?? 0}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Total</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1 mt-2 w-full">
                {pipelineSegments.map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-[11px] text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      {s.label}
                    </span>
                    <span className="font-semibold">{s.value} ({Math.round(s.value / pipelineTotal * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-3 gap-4 pb-4">

        {/* Hot Prospects */}
        <div className="bg-white border border-gray-100 rounded-[3px] p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold">🔥 Hot Prospects</p>
            <button className="text-xs text-blue-500 hover:underline">View All</button>
          </div>
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-2 mb-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-100" />
                <div className="flex-1"><div className="h-3 bg-gray-100 rounded w-24 mb-1" /><div className="h-2 bg-gray-50 rounded w-16" /></div>
              </div>
            ))
          ) : !stats?.hotProspects?.length ? (
            <p className="text-xs text-gray-400 text-center py-4">Aucun prospect scoré</p>
          ) : (
            stats.hotProspects.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {p.firstName?.[0]}{p.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-gray-400">
                      {p.budget ? `${Number(p.budget).toLocaleString("fr-MA")} MAD` : "Budget N/A"}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded">
                  {Math.round((p.score ?? 0) * 100)} Score
                </span>
              </div>
            ))
          )}
        </div>

        {/* Properties Summary */}
        <div className="bg-white border border-gray-100 rounded-[3px] p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">📊 Résumé des propriétés</p>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {Array(4).fill(0).map((_, i) => <div key={i} className="h-8 bg-gray-50 rounded" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Total", value: stats?.totalProperties ?? 0, color: "bg-gray-100 text-gray-700" },
                { label: "Available", value: stats?.availableProperties ?? 0, color: "bg-green-100 text-green-700" },
                { label: "Reserved", value: stats?.reservedProperties ?? 0, color: "bg-yellow-100 text-yellow-700" },
                { label: "Sold", value: stats?.soldProperties ?? 0, color: "bg-blue-100 text-blue-700" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-2 rounded bg-gray-50">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.color}`}>
                    {item.value}
                  </span>
                </div>
              ))}
              <div className="pt-1 border-t border-gray-100 text-xs text-gray-400 text-center">
                Taux de conversion : <span className="font-semibold text-[#1a1a1a]">{stats?.conversionRate ?? 0}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Support — real tickets */}
        <div className="bg-white border border-gray-100 rounded-[3px] p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold">💬 Tickets récents</p>
            <span className="text-[10px] bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded">
              {stats?.openTickets ?? "…"} ouverts
            </span>
          </div>
          {loading ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="border border-gray-100 rounded p-2 mb-2 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-32 mb-1" />
                <div className="h-2 bg-gray-50 rounded w-full" />
              </div>
            ))
          ) : !stats?.recentTickets?.length ? (
            <p className="text-xs text-gray-400 text-center py-4">Aucun ticket</p>
          ) : (
            stats.recentTickets.map((t: any) => (
              <div key={t.id} className="border border-gray-100 rounded p-2 mb-2">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-semibold truncate max-w-[70%]">{t.title}</p>
                  <span className="text-[10px] text-gray-400">{calculateTimeAgo(t.createdAt)}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">{t.description}</p>
                <div className="flex gap-1.5 mt-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${PRIORITY_STYLE[t.priority] ?? "bg-gray-100 text-gray-500"}`}>
                    {t.priority}
                  </span>
                  <span className="text-[10px] text-gray-400">#{t.id}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
