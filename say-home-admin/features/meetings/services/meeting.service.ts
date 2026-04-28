import { apiFetch } from "@/shared/lib/api-fetch";
import type { MeetingsBoardResponse } from "../types/meeting.types";

const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api";

export interface AppointmentPayload {
  prospectId: number;
  agentId: number;
  propertyId?: number | null;
  date: string;
  time: string;
  meetingType: string;
  notes: string;
}

export interface AppointmentDetail {
  id: number;
  prospectId: number;
  prospectName: string;
  agentId: number;
  agentName: string;
  propertyId?: number | null;
  date: string;
  time: string;
  meetingType: string;
  notes: string;
  status: string;
}

async function readErrorMessage(response: Response, fallback: string) {
  const error = await response.json().catch(() => null);
  return error?.message ?? error?.error ?? fallback;
}

export const meetingService = {
  async getBoard(): Promise<MeetingsBoardResponse> {
    const response = await apiFetch(`${API_BASE_URL}/appointments/board`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Unable to load meetings board");
    const result = await response.json();
    return result.data as MeetingsBoardResponse;
  },

  async createAppointment(payload: AppointmentPayload) {
    const response = await apiFetch(`${API_BASE_URL}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(await readErrorMessage(response, "Unable to create meeting"));
  },

  async getAppointment(id: number): Promise<AppointmentDetail> {
    const response = await apiFetch(`${API_BASE_URL}/appointments/${id}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load meeting");
    const result = await response.json();
    return result.data as AppointmentDetail;
  },

  async updateAppointment(id: number, payload: AppointmentPayload) {
    const response = await apiFetch(`${API_BASE_URL}/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(await readErrorMessage(response, "Unable to update meeting"));
  },

  async cancelAppointment(id: number) {
    const response = await apiFetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error(await readErrorMessage(response, "Unable to cancel meeting"));
  },

  async deleteAppointment(id: number) {
    const response = await apiFetch(`${API_BASE_URL}/appointments/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(await readErrorMessage(response, "Unable to delete meeting"));
  },
};
