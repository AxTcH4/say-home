import { apiClient } from "@/shared/lib/axios";
import type {
  ApiResponse,
  DashboardProfile,
  DashboardProfileUpdatePayload,
  RealEstateRecord,
  DashboardSummary,
} from "../types/account.types";

export const accountService = {
  async getProfile(userId: number) {
    const { data } = await apiClient.get<ApiResponse<DashboardProfile>>(
      `/user/profile/${userId}`
    );
    return data.data;
  },

  async getSummary(userId: number) {
    const { data } = await apiClient.get<ApiResponse<DashboardSummary>>(
      `/user/summary/${userId}`
    );
    return data.data;
  },

  async getRealEstate(userId: number) {
    const { data } = await apiClient.get<RealEstateRecord[]>(
      `/user/real-estate/${userId}`
    );
    return data;
  },

  async updateProfile(userId: number, payload: DashboardProfileUpdatePayload) {
    const { data } = await apiClient.put<ApiResponse<DashboardProfile>>(
      `/user/profile/${userId}`,
      payload
    );
    return data.data;
  },
};
