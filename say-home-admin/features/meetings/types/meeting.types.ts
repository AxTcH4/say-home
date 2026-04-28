export interface MeetingRequestItem {
  id: number;
  prospectId: number;
  prospectName: string;
  city: string;
  budgetLabel: string;
  requestedDate: string;
  message: string;
}

export interface MeetingEvent {
  id: number;
  prospectId?: number | null;
  title: string;
  agentName: string;
  location: string;
  type: string;
  status: string;
  dayLabel: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface MeetingsBoardResponse {
  currentRangeLabel: string;
  requests: MeetingRequestItem[];
  events: MeetingEvent[];
}
