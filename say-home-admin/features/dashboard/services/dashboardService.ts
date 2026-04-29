import { apiClient } from "@/shared/lib/axios";

export const dashboardService = {
  async getStats() {
    const res = await apiClient.get("/user/stats");
    return res.data;
  },
};
