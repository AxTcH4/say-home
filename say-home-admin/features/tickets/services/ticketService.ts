import { apiClient } from "@/shared/lib/axios"

//service: talk to backend
export const ticketService = {
async getAllChatSessions () {
    const res = await apiClient.get("/helpdesk/sessions");
    const data =  res.data;
    console.log("RESULTS: ", data);
    return data;
},

async deleteChatSession (id: number) {
  const res = await apiClient.delete(`/helpdesk/sessions/delete/${id}`);
  const data =  res.data;
  console.log("RESULTS: ", data);
  return data;
}

}


