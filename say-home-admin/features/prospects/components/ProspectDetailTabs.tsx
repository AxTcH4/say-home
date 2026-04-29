"use client";

import { useState } from "react";
import type { ProspectDetail } from "../types/prospect.types";

interface ProspectDetailTabsProps {
  prospect: ProspectDetail;
}

type TabKey = "info" | "interactions" | "meetings" | "feedback";

const tabs: { key: TabKey; label: string }[] = [
  { key: "info", label: "Info" },
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
