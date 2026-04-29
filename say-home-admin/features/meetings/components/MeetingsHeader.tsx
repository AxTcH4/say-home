interface MeetingsHeaderProps {
  currentRangeLabel: string;
  view: "day" | "week" | "month";
  onViewChange: (view: "day" | "week" | "month") => void;
  onToday: () => void;
}

export function MeetingsHeader({
  currentRangeLabel,
  view,
  onViewChange,
  onToday,
}: MeetingsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-[42px] font-semibold tracking-[-0.03em] text-[#172033]">
          Meetings & Visits
        </h1>
        <p className="mt-2 text-sm text-[#70819a]">{currentRangeLabel}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="rounded-[12px] border border-[#e4eaf4] bg-white p-1">
          {(["day", "week", "month"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onViewChange(item)}
              className={`rounded-[8px] px-4 py-2 text-sm transition ${
                view === item
                  ? "bg-[#edf3ff] font-semibold text-[#376fd9]"
                  : "text-[#70819a] hover:bg-[#f7f9fc]"
              }`}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onToday}
          className="rounded-[10px] border border-[#e4eaf4] bg-white px-4 py-2 text-sm font-semibold text-[#172033] transition hover:bg-[#f7f9fc]"
        >
          Today
        </button>
      </div>
    </div>
  );
}
