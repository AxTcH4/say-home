import { apiFetch } from "@/shared/lib/api-fetch";
import type {
  CreateProspectPayload,
  ProspectDetail,
  ProspectListResponse,
  ProspectQueryParams,
  UpdateProspectPayload,
  CreateInteractionPayload,
} from "../types/prospect.types";

const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api";

function buildQuery(params: ProspectQueryParams) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.assignedAgent) {
    searchParams.set("assignedAgent", params.assignedAgent);
  }
  if (params.source) searchParams.set("source", params.source);

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function fetchProspects(
  params: ProspectQueryParams
): Promise<ProspectListResponse> {
  const response = await apiFetch(`${API_BASE_URL}/prospects${buildQuery(params)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load prospects");
  }

  const result = await response.json();
  return result.data as ProspectListResponse;
}

export const prospectService = {
  async getProspects(params: ProspectQueryParams): Promise<ProspectListResponse> {
    return await fetchProspects(params);
  },

  async getProspectById(id: number): Promise<ProspectDetail> {
    const response = await apiFetch(`${API_BASE_URL}/prospects/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to load prospect detail");
    }

    const result = await response.json();
    return result.data as ProspectDetail;
  },

  async createProspect(payload: CreateProspectPayload) {
    const response = await apiFetch(`${API_BASE_URL}/prospects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Unable to create prospect");
    }

    const result = await response.json();
    return result.data as ProspectDetail;
  },

  async updateProspect(id: number, payload: UpdateProspectPayload) {
    const response = await apiFetch(`${API_BASE_URL}/prospects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Unable to update prospect");
    }

    const result = await response.json();
    return result.data as ProspectDetail;
  },

  async addInteraction(id: number, payload: CreateInteractionPayload) {
    const response = await apiFetch(`${API_BASE_URL}/prospects/${id}/interactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Unable to add interaction");
    }

    const result = await response.json();
    return result.data as ProspectDetail;
  },

  async deleteProspect(id: number) {
    const response = await apiFetch(`${API_BASE_URL}/prospects/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Unable to delete prospect");
    }
  },
};
