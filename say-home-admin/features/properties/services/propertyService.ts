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
    const res = await apiClient.post("/properties", formData);
    return res.data;
  },

  async update(id: number, payload: Record<string, unknown>) {
    const res = await apiClient.put(`/properties/${id}`, payload);
    return res.data;
  },

  async replaceImages(id: number, formData: FormData) {
    const res = await apiClient.post(`/properties/${id}/images`, formData);
    return res.data;
  },

  async remove(id: number) {
    const res = await apiClient.delete(`/properties/${id}`);
    return res.data;
  },
};
