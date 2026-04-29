import { apiClient } from "@/shared/lib/axios";
import { Message } from "../components/chatbotBubble";

export const chatbotService = {
  async sendMessage(userMessage: Message) {
    return await apiClient.post("/helpdesk/new", userMessage);
  },

  async getActiveSessions() {
    const response = await apiClient.get("/helpdesk/sessions/active");
    return response.data;
  },
};
