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
},

async getAllTickets () {
  const res = await apiClient.get("/helpdesk/tickets");
  const data =  res.data;
  console.log("RESULTS: ", data);
  return data;
},

async deleteTicket (id: number) {
  const res = await apiClient.delete(`/helpdesk/tickets/delete/${id}`);
  const data =  res.data;
  console.log("RESULTS: ", data);
  return data;
},

async updateTicket (id: number, payload: any) {
  const res = await apiClient.put(`/helpdesk/tickets/${id}`, payload);
  const data =  res.data;
  console.log("RESULTS: ", data);
  return data;
},

async createTicket (payload: any) {
  const res = await apiClient.post(`/helpdesk/tickets/new`, payload);
  const data =  res.data;
  console.log("RESULTS: ", data);
  return data;
},

}


