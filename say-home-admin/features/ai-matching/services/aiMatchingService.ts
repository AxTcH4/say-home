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

interface ImageMatchResult {
  [key: string]: unknown;
}

interface ExtractedImageCriteria {
  [key: string]: unknown;
}

interface SearchByImageResponse {
  results: ImageMatchResult[];
  extracted: ExtractedImageCriteria;
}

export const aiMatchingService = {
  async search(params: SearchParams) {
    const res = await apiClient.get("/properties/search", { params });
    return res.data;
  },

  async searchByImage(file: File): Promise<SearchByImageResponse> {
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
