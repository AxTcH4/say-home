import { apiFetch } from "@/shared/lib/api-fetch";
import type {
  PipelineBoardResponse,
  PipelineQueryParams,
  UpdatePipelineStatusPayload,
} from "../types/pipeline.types";

const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api";

function buildQuery(params: PipelineQueryParams) {
  const searchParams = new URLSearchParams();

  if (params.assignedAgent) searchParams.set("assignedAgent", params.assignedAgent);
  if (params.city) searchParams.set("city", params.city);
  if (params.source) searchParams.set("source", params.source);

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const pipelineService = {
  async getBoard(params: PipelineQueryParams): Promise<PipelineBoardResponse> {
    const response = await apiFetch(`${API_BASE_URL}/pipeline${buildQuery(params)}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to load pipeline board");
    }

    const result = await response.json();
    return result.data as PipelineBoardResponse;
  },

  async updateProspectStatus(payload: UpdatePipelineStatusPayload) {
    const response = await apiFetch(
      `${API_BASE_URL}/pipeline/prospects/${payload.prospectId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: payload.status }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Unable to update pipeline status");
    }
  },
};
