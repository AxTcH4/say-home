"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { meetingService, type AppointmentPayload } from "../services/meeting.service";
import type { AdminUserItem } from "@/features/users/types/user.types";
import type { ProspectListItem } from "@/features/prospects/types/prospect.types";

interface MeetingFormProps {
  agents: AdminUserItem[];
  prospects: ProspectListItem[];
  mode: "create" | "edit";
  appointmentId?: number;
  initialValues?: AppointmentPayload;
}

const WEEK_DAYS = ["lu", "ma", "me", "je", "ve", "sa", "di"];
const MONTHS_FR = [
  "janvier",
  "fevrier",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "aout",
  "septembre",
  "octobre",
  "novembre",
  "decembre",
];

export function MeetingForm({
  agents,
  prospects,
  mode,
  appointmentId,
  initialValues,
}: MeetingFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AppointmentPayload>(
    initialValues ?? {
      prospectId: prospects[0]?.id ?? 0,
      agentId: agents[0]?.id ?? 0,
      propertyId: null,
      date: "",
      time: "",
      meetingType: "Call",
      notes: "",
    }
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateMeetingDateTime(form.date, form.time);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (mode === "create") await meetingService.createAppointment(form);
      else if (appointmentId) await meetingService.updateAppointment(appointmentId, form);
      router.push("/appointments");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save meeting");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[18px] border border-[#e7edf5] bg-white p-6 shadow-[0_12px_35px_rgba(20,32,60,0.06)]"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Prospect">
          <select
            value={form.prospectId}
            onChange={(e) =>
              setForm((c) => ({ ...c, prospectId: Number(e.target.value) }))
            }
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none transition focus:border-[#2c1a0e] focus:shadow-[0_0_0_4px_rgba(44,26,14,0.08)]"
          >
            {prospects.map((prospect) => (
              <option key={prospect.id} value={prospect.id}>
                {prospect.fullName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Assigned Agent">
          <select
            value={form.agentId}
            onChange={(e) =>
              setForm((c) => ({ ...c, agentId: Number(e.target.value) }))
            }
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none transition focus:border-[#2c1a0e] focus:shadow-[0_0_0_4px_rgba(44,26,14,0.08)]"
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.fullName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <DatePickerField
            value={form.date}
            onChange={(value) => {
              setError(null);
              setForm((c) => ({ ...c, date: value }));
            }}
          />
        </Field>
        <Field label="Time">
          <TimeField
            value={form.time}
            onChange={(value) => {
              setError(null);
              setForm((c) => ({ ...c, time: value }));
            }}
          />
        </Field>
        <Field label="Meeting Type">
          <select
            value={form.meetingType}
            onChange={(e) =>
              setForm((c) => ({ ...c, meetingType: e.target.value }))
            }
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none transition focus:border-[#2c1a0e] focus:shadow-[0_0_0_4px_rgba(44,26,14,0.08)]"
          >
            <option value="Call">Call</option>
            <option value="Visit">Visit</option>
            <option value="Urgent">Urgent</option>
            <option value="Internal">Internal</option>
          </select>
        </Field>
        <Field label="Notes">
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))}
            className="w-full rounded-[12px] border border-[#e4eaf4] px-4 py-3 text-sm outline-none transition focus:border-[#2c1a0e] focus:shadow-[0_0_0_4px_rgba(44,26,14,0.08)]"
          />
        </Field>
      </div>
      {error ? (
        <p className="mt-4 rounded-[10px] bg-[#ffe8e8] px-3 py-2 text-sm text-[#c13d3d]">
          {error}
        </p>
      ) : null}
      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="rounded-[10px] bg-[#2c1a0e] px-5 py-3 text-sm font-semibold text-white"
        >
          {mode === "create" ? "Create Meeting" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/appointments")}
          className="rounded-[10px] border border-[#e4eaf4] px-5 py-3 text-sm font-semibold text-[#172033]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#172033]">{label}</span>
      {children}
    </label>
  );
}

function DatePickerField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const initialDate = value ? parseYmd(value) : new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDate = value ? parseYmd(value) : null;
  const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const today = startOfToday();

  const selectDate = (date: Date) => {
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    onChange(toYmd(date));
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center rounded-[12px] border border-[#e4eaf4] bg-[#fbfcfe] px-4 text-left text-sm text-[#172033] transition hover:bg-white focus:border-[#2c1a0e] focus:bg-white focus:shadow-[0_0_0_4px_rgba(44,26,14,0.08)]"
      >
        <CalendarDays className="mr-3 h-4 w-4 text-[#7a8aa0]" />
        <span className={value ? "text-[#172033]" : "text-[#8ca0ba]"}>
          {value ? formatFrDate(selectedDate!) : "Select a date"}
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-[320px] rounded-[20px] border border-[#e6edf7] bg-white p-4 shadow-[0_18px_45px_rgba(18,31,53,0.16)]">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1)
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e7edf5] text-[#52627b] transition hover:bg-[#f7f9fc]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <p className="text-[15px] font-semibold capitalize text-[#172033]">
                {MONTHS_FR[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
              </p>
              <p className="mt-1 text-xs text-[#7d8ca2]">Choose a meeting date</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e7edf5] text-[#52627b] transition hover:bg-[#f7f9fc]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-3 grid grid-cols-7 gap-1">
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-[#8ca0ba]"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date) => {
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isSelected =
                selectedDate != null && toYmd(date) === toYmd(selectedDate);
              const isToday = toYmd(date) === toYmd(today);
              const isPast = date < today;

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => {
                    if (!isPast) selectDate(date);
                  }}
                  disabled={isPast}
                  className={`flex h-10 w-10 items-center justify-center rounded-[12px] text-sm transition ${
                    isPast
                      ? "cursor-not-allowed text-[#d0d8e5]"
                      : ""
                  } ${
                    isSelected
                      ? "bg-[#2c1a0e] font-semibold text-white shadow-[0_8px_20px_rgba(44,26,14,0.25)]"
                      : isToday
                        ? "border border-[#c9d8f2] bg-[#edf3ff] font-semibold text-[#376fd9]"
                      : isCurrentMonth
                          ? "text-[#172033] hover:bg-[#f7f9fc]"
                          : "text-[#afbccf] hover:bg-[#f7f9fc]"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#edf2f8] pt-4">
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-sm font-medium text-[#7d8ca2] transition hover:text-[#172033]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => selectDate(new Date())}
              className="rounded-full bg-[#edf3ff] px-4 py-2 text-sm font-semibold text-[#376fd9] transition hover:bg-[#dfe9ff]"
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TimeField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="group flex h-12 items-center rounded-[12px] border border-[#e4eaf4] bg-[#fbfcfe] px-4 transition focus-within:border-[#2c1a0e] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(44,26,14,0.08)]">
      <Clock3 className="mr-3 h-4 w-4 text-[#7a8aa0]" />
      <input
        type="time"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="crm-time-input h-full w-full bg-transparent text-sm text-[#172033] outline-none"
      />
    </div>
  );
}

function parseYmd(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function toYmd(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatFrDate(date: Date) {
  return `${date.getDate()} ${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
}

function buildCalendarDays(visibleMonth: Date) {
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const next = new Date(startDate);
    next.setDate(startDate.getDate() + index);
    return next;
  });
}

function validateMeetingDateTime(date: string, time: string) {
  if (!date || !time) {
    return null;
  }

  const appointmentDate = parseYmd(date);
  const [hours, minutes] = time.split(":").map(Number);
  appointmentDate.setHours(hours, minutes, 0, 0);

  if (appointmentDate.getTime() < Date.now()) {
    return "You cannot schedule a meeting in the past.";
  }

  return null;
}
