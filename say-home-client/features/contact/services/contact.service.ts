import { apiClient } from "@/shared/lib/axios";
import type { ContactPayload } from "../types/contact.types";

export const contactService = {
  async sendMessage(payload: ContactPayload) {
    const { data } = await apiClient.post("/contact", {
      name: `${payload.firstName} ${payload.lastName}`.trim(),
      email: payload.email,
      message: payload.message,
    });
    return data;
  },
};
