import { apiClient } from "@/lib/axios";
import type {
  ApiResponse,
  DashboardProfile,
  DashboardProfileUpdatePayload,
  DashboardSummary,
} from "../types/account.types";

export const accountService = {
  async getProfile(userId: number) {
    const { data } = await apiClient.get<ApiResponse<DashboardProfile>>(
      `/dashboard/profile/${userId}`
    );
    return data.data;
  },

  async getSummary(userId: number) {
    const { data } = await apiClient.get<ApiResponse<DashboardSummary>>(
      `/dashboard/summary/${userId}`
    );
    return data.data;
  },

  async updateProfile(userId: number, payload: DashboardProfileUpdatePayload) {
    const { data } = await apiClient.put<ApiResponse<DashboardProfile>>(
      `/dashboard/profile/${userId}`,
      payload
    );
    return data.data;
  },
};
