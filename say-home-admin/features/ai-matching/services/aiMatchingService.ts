import { apiClient } from "@/shared/lib/axios";

export interface SearchParams {
  title?: string;
  type?: string;
  secteur?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const aiMatchingService = {
  async search(params: SearchParams) {
    const res = await apiClient.get("/properties/search", { params });
    return res.data;
  },
};
