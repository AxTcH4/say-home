"use client";

import { useMemo, useState } from "react";
import { MeetingRequests } from "./MeetingRequests";
import { MeetingsCalendar } from "./MeetingsCalendar";
import { MeetingsHeader } from "./MeetingsHeader";
import type { MeetingsBoardResponse } from "../types/meeting.types";

interface AppointmentsBoardProps {
  board: MeetingsBoardResponse;
}

export function AppointmentsBoard({ board }: AppointmentsBoardProps) {
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [anchorDate, setAnchorDate] = useState(() => getInitialAnchorDate(board.events));

  const currentRangeLabel = useMemo(
    () => formatRangeLabel(anchorDate, view),
    [anchorDate, view]
  );

  return (
    <section className="space-y-6">
      <MeetingsHeader
        currentRangeLabel={currentRangeLabel}
        view={view}
        onViewChange={setView}
        onToday={() => setAnchorDate(new Date())}
      />
      <MeetingRequests requests={board.requests} />
      <MeetingsCalendar events={board.events} view={view} anchorDate={anchorDate} />
    </section>
  );
}

function getInitialAnchorDate(events: MeetingsBoardResponse["events"]) {
  if (events.length === 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  const [year, month, day] = events[0].date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatRangeLabel(anchorDate: Date, view: "day" | "week" | "month") {
  if (view === "day") {
    return anchorDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  if (view === "month") {
    return anchorDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  }

  const weekNumber = getWeekNumber(anchorDate);
  return `${anchorDate.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  })} - Week ${weekNumber}`;
}

function getWeekNumber(date: Date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
