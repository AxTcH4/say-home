import { apiFetch } from "@/shared/lib/api-fetch";
import type {
  AssignProspectPropertyPayload,
  CreateProspectPropertyInteractionPayload,
  CreateProspectPayload,
  ProspectDetail,
  ProspectPropertyDocumentType,
  ProspectListResponse,
  ProspectQueryParams,
  ProspectPropertyRecord,
  CreateInteractionPayload,
  UpdateProspectPayload,
  UpdateProspectPropertyPayload,
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
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));

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

  async assignProperty(payload: AssignProspectPropertyPayload) {
    const response = await apiFetch(`${API_BASE_URL}/prospect-properties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Unable to assign property");
    }

    const result = await response.json();
    return result.data as ProspectPropertyRecord;
  },

  async updatePropertyRecord(
    recordId: number,
    payload: UpdateProspectPropertyPayload,
  ) {
    const response = await apiFetch(
      `${API_BASE_URL}/prospect-properties/${recordId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Unable to update property record");
    }

    const result = await response.json();
    return result.data as ProspectPropertyRecord;
  },

  async addPropertyInteraction(
    recordId: number,
    payload: CreateProspectPropertyInteractionPayload,
  ) {
    const response = await apiFetch(
      `${API_BASE_URL}/prospect-properties/${recordId}/interactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Unable to add property interaction");
    }

    const result = await response.json();
    return result.data as ProspectPropertyRecord;
  },

  async deletePropertyRecord(recordId: number) {
    const response = await apiFetch(`${API_BASE_URL}/prospect-properties/${recordId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Unable to delete property record");
    }
  },

  async uploadPropertyDocuments(
    recordId: number,
    type: ProspectPropertyDocumentType,
    files: File[],
  ) {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    const response = await apiFetch(
      `${API_BASE_URL}/prospect-properties/${recordId}/documents?type=${type}`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Unable to upload property document");
    }

    const result = await response.json();
    return result.data as ProspectPropertyRecord;
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
