import { apiClient } from "@/shared/lib/axios";

const AI_URL =
  process.env.NEXT_PUBLIC_AI_URL ?? "http://localhost:8000";

export interface SearchParams {
  title?: string;
  type?: string;
  secteur?: string;
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  minRooms?: number;
}

export const aiMatchingService = {
  async search(params: SearchParams) {
    const res = await apiClient.get("/properties/search", { params });
    return res.data;
  },

  async searchByImage(file: File): Promise<{ results: any[]; extracted: Record<string, any> }> {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch(`${AI_URL}/search/match-by-image`, {
      method: "POST",
      body,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail ?? "Image matching failed");
    }
    return res.json();
  },
};
