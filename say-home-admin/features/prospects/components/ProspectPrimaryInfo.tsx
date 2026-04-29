import type { ProspectDetail } from "../types/prospect.types";

interface ProspectPrimaryInfoProps {
  prospect: ProspectDetail;
}

const items = [
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "city", label: "City" },
  { key: "budgetLabel", label: "Budget" },
  { key: "source", label: "Source" },
  { key: "assignedAgentName", label: "Assigned Agent" },
] as const;

export function ProspectPrimaryInfo({ prospect }: ProspectPrimaryInfoProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-[16px] border border-[#e7edf5] bg-white px-5 py-4 shadow-[0_12px_35px_rgba(20,32,60,0.06)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8ca2]">
            {item.label}
          </p>
          <p className="mt-3 text-base font-semibold text-[#172033]">
            {prospect[item.key] || "-"}
          </p>
        </div>
      ))}
    </div>
  );
}
