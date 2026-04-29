import { apiClient } from "@/shared/lib/axios";

export const propertyService = {
  async getAll() {
    const res = await apiClient.get("/properties");
    return res.data;
  },

  async getById(id: number) {
    const res = await apiClient.get(`/properties/${id}`);
    return res.data;
  },

  async create(formData: FormData) {
    const res = await apiClient.post("/properties", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
