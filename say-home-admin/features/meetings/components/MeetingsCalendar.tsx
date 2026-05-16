"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck2, CalendarRange, Eye, MapPin, MoreHorizontal, PencilLine, Trash2, XCircle } from "lucide-react";
import { meetingService } from "../services/meeting.service";
import type { MeetingEvent } from "../types/meeting.types";

interface MeetingsCalendarProps {
  events: MeetingEvent[];
  view: "day" | "week" | "month";
  anchorDate: Date;
}

const START_HOUR = 0;
const END_HOUR = 24;
const HOUR_HEIGHT = 92;
const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const EVENT_THEME: Record<
  string,
  { background: string; border: string; badge: string; text: string }
> = {
  CALL: {
    background: "#eaf1ff",
    border: "#5f8dff",
    badge: "#d8e6ff",
    text: "#2f5fbf",
  },
  VISIT: {
    background: "#e8f7ef",
    border: "#49b37b",
    badge: "#d7f0e2",
    text: "#247954",
  },
  INTERNAL: {
    background: "#efe8ff",
    border: "#8d69f8",
    badge: "#e3d8ff",
    text: "#6f45dd",
  },
  URGENT: {
    background: "#fff2df",
    border: "#f1b84b",
    badge: "#ffe6bc",
    text: "#ad7413",
  },
};

export function MeetingsCalendar({ events, view, anchorDate }: MeetingsCalendarProps) {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const gridTemplate = "84px repeat(7, minmax(150px, 1fr))";
  const dayColumns = useMemo(() => buildVisibleDays(anchorDate, view), [anchorDate, view]);
  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, MeetingEvent[]>>((acc, event) => {
      acc[event.date] ??= [];
      acc[event.date].push(event);
      acc[event.date].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      return acc;
    }, {});
  }, [events]);

  const handleCancel = async (id: number) => {
    await meetingService.cancelAppointment(id);
    setOpenMenuId(null);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Delete this meeting permanently?");
    if (!confirmed) return;

    await meetingService.deleteAppointment(id);
    setOpenMenuId(null);
    router.refresh();
  };

  const handleComplete = async (id: number) => {
    await meetingService.completeAppointment(id);
    setOpenMenuId(null);
    router.refresh();
  };

  if (view === "month") {
    return (
      <section className="overflow-hidden rounded-[20px] border border-[#e7edf5] bg-white shadow-[0_12px_35px_rgba(20,32,60,0.06)]">
        <MonthView
          days={dayColumns}
          eventsByDate={eventsByDate}
          onDelete={handleDelete}
          onCancel={handleCancel}
          onComplete={handleComplete}
          openMenuId={openMenuId}
          onToggleMenu={setOpenMenuId}
        />
      </section>
    );
  }

  const visibleTemplate =
    view === "day" ? "84px minmax(320px, 1fr)" : gridTemplate;

  return (
    <section className="overflow-hidden rounded-[20px] border border-[#e7edf5] bg-white shadow-[0_12px_35px_rgba(20,32,60,0.06)]">
      <div
        className="grid border-b border-[#edf2f8] bg-[#fbfcfe]"
        style={{ gridTemplateColumns: visibleTemplate }}
      >
        <div className="px-4 py-4" />
        {dayColumns.map((day) => (
          <div key={day.date} className="border-l border-[#edf2f8] px-3 py-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d9bb0]">
              {day.label}
            </p>
            <p className="mt-1 text-[28px] font-semibold leading-none text-[#172033]">
              {day.dayNumber}
            </p>
            <p className="mt-1 text-xs text-[#8d9bb0]">{day.monthLabel}</p>
          </div>
        ))}
      </div>

      <div className="max-h-[72vh] overflow-auto">
        <div className="grid" style={{ gridTemplateColumns: visibleTemplate }}>
        <div className="border-r border-[#edf2f8] bg-white">
          {Array.from({ length: END_HOUR - START_HOUR }, (_, index) => {
            const hour = START_HOUR + index;
            return (
              <div
                key={hour}
                className="flex h-[92px] items-start justify-center border-b border-[#f2f5fa] pt-3 text-xs font-medium text-[#9aa8bc]"
              >
                {`${String(hour).padStart(2, "0")}:00`}
              </div>
            );
          })}
        </div>

        {dayColumns.map((day) => (
          <div key={day.date} className="border-r border-[#edf2f8] last:border-r-0">
            <div className="relative" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
              {Array.from({ length: END_HOUR - START_HOUR }, (_, index) => (
                <div key={index} className="h-[92px] border-b border-[#f2f5fa]" />
              ))}

              <div className="absolute inset-0 px-3 py-2">
                {(eventsByDate[day.date] ?? []).map((event) => {
                  const theme = EVENT_THEME[event.type.toUpperCase()] ?? EVENT_THEME.CALL;
                  const top = calculateTop(event.startTime);
                  const height = calculateHeight(event.startTime, event.endTime);

                  return (
                    <article
                      key={event.id}
                      className="absolute left-3 right-3 rounded-[18px] border p-4 shadow-[0_16px_30px_rgba(30,45,72,0.10)]"
                      style={{
                        top: `${top}px`,
                        minHeight: `${Math.max(110, height)}px`,
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        boxShadow: `0 14px 28px ${hexToRgba(theme.border, 0.18)}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[12px] font-semibold" style={{ color: theme.text }}>
                            {event.startTime} - {event.endTime}
                          </p>
                          <p className="mt-2 text-[15px] font-semibold text-[#172033]">
                            {event.title}
                          </p>
                          <p className="mt-1 text-xs text-[#61728b]">
                            Agent: {event.agentName}
                          </p>
                        </div>
                        <span
                          className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
                          style={{ backgroundColor: theme.badge, color: theme.text }}
                        >
                          {event.type}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <Link
                          href={`/appointments/${event.id}/edit`}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#172033] transition hover:text-[#2c1a0e]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Detail
                        </Link>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId((current) => (current === event.id ? null : event.id))
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/85 text-[#172033] shadow-sm transition hover:bg-white"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {openMenuId === event.id ? (
                            <div className="absolute right-0 top-11 z-20 w-44 rounded-[16px] border border-[#e7edf5] bg-white p-2 shadow-[0_18px_35px_rgba(20,32,60,0.16)]">
                              <Link
                                href={`/appointments/${event.id}/edit`}
                                className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-[#172033] transition hover:bg-[#f7f9fc]"
                              >
                                <PencilLine className="h-4 w-4" />
                                Edit
                              </Link>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-[#172033] transition hover:bg-[#f7f9fc]"
                              >
                                <MapPin className="h-4 w-4" />
                                Directions
                              </a>
                              <button
                                type="button"
                                onClick={() => handleCancel(event.id)}
                                className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-[#d24a4a] transition hover:bg-[#fff3f3]"
                              >
                                <XCircle className="h-4 w-4" />
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleComplete(event.id)}
                                className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-[#22734f] transition hover:bg-[#f2fbf5]"
                              >
                                <CalendarCheck2 className="h-4 w-4" />
                                Finish
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(event.id)}
                                className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-[#a83939] transition hover:bg-[#fff3f3]"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

function MonthView({
  days,
  eventsByDate,
  onCancel,
  onComplete,
  onDelete,
  openMenuId,
  onToggleMenu,
}: {
  days: CalendarDay[];
  eventsByDate: Record<string, MeetingEvent[]>;
  onCancel: (id: number) => Promise<void>;
  onComplete: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  openMenuId: number | null;
  onToggleMenu: (id: number | null) => void;
}) {
  return (
    <div className="grid grid-cols-7 border-t border-[#edf2f8]">
      {days.map((day) => {
        const dayEvents = (eventsByDate[day.date] ?? []).slice(0, 3);
        return (
          <div
            key={day.date}
            className={`min-h-[164px] border-b border-r border-[#edf2f8] p-3 last:border-r-0 ${
              day.isCurrentMonth ? "bg-white" : "bg-[#fafbfd]"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9aa8bc]">
                {day.label}
              </span>
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  day.isToday
                    ? "bg-[#2c1a0e] text-white"
                    : day.isCurrentMonth
                      ? "text-[#172033]"
                      : "text-[#9aa8bc]"
                }`}
              >
                {day.dayNumber}
              </span>
            </div>

            <div className="space-y-2">
              {dayEvents.map((event) => (
                <div key={event.id} className="rounded-[14px] border border-[#e7edf5] bg-[#fbfcfe] p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-[#376fd9]">
                        {event.startTime}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#172033]">
                        {event.title}
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => onToggleMenu(openMenuId === event.id ? null : event.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#70819a] transition hover:bg-white"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenuId === event.id ? (
                        <div className="absolute right-0 top-9 z-20 w-40 rounded-[14px] border border-[#e7edf5] bg-white p-2 shadow-[0_18px_35px_rgba(20,32,60,0.16)]">
                          <Link
                            href={`/appointments/${event.id}/edit`}
                            className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-[#172033] hover:bg-[#f7f9fc]"
                          >
                            <Eye className="h-4 w-4" />
                            Detail
                          </Link>
                          <button
                            type="button"
                            onClick={() => onCancel(event.id)}
                            className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-[#d24a4a] hover:bg-[#fff3f3]"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => onComplete(event.id)}
                            className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-[#22734f] hover:bg-[#f2fbf5]"
                          >
                            <CalendarCheck2 className="h-4 w-4" />
                            Finish
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(event.id)}
                            className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-[#a83939] hover:bg-[#fff3f3]"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              {(eventsByDate[day.date] ?? []).length > 3 ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-[#edf3ff] px-3 py-1 text-xs font-semibold text-[#376fd9]">
                  <CalendarRange className="h-3.5 w-3.5" />
                  +{(eventsByDate[day.date] ?? []).length - 3} more
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface CalendarDay {
  date: string;
  label: string;
  dayNumber: number;
  monthLabel: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

function buildVisibleDays(anchorDate: Date, view: "day" | "week" | "month"): CalendarDay[] {
  if (view === "day") {
    return [toCalendarDay(anchorDate, true)];
  }

  if (view === "month") {
    return buildMonthDays(anchorDate);
  }

  const monday = getMonday(anchorDate);

  return Array.from({ length: 7 }, (_, index) => {
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + index);
    return toCalendarDay(nextDate, true);
  });
}

function buildMonthDays(anchorDate: Date) {
  const firstDay = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const nextDate = new Date(startDate);
    nextDate.setDate(startDate.getDate() + index);
    return toCalendarDay(nextDate, nextDate.getMonth() === anchorDate.getMonth());
  });
}

function getMonday(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
  return {
    date: toYmd(date),
    label: DAY_LABELS[(date.getDay() + 6) % 7],
    dayNumber: date.getDate(),
    monthLabel: date.toLocaleDateString("fr-FR", { month: "short" }),
    isCurrentMonth,
    isToday: toYmd(date) === toYmd(new Date()),
  };
}

function toYmd(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function calculateTop(startTime: string) {
  const minutesFromStart = timeToMinutes(startTime) - START_HOUR * 60;
  return (minutesFromStart / 60) * HOUR_HEIGHT;
}

function calculateHeight(startTime: string, endTime: string) {
  const durationMinutes = Math.max(45, timeToMinutes(endTime) - timeToMinutes(startTime));
  return (durationMinutes / 60) * HOUR_HEIGHT - 8;
}

function hexToRgba(hex: string, alpha: number) {
  const sanitized = hex.replace("#", "");
  const bigint = Number.parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
