import { apiClient } from "@/shared/lib/axios";
import type { CreateTicketPayload, TicketItem } from "../types/ticket.types";

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

async getTickets (): Promise<TicketItem[]> {
  const response = await this.getAllTickets();
  const data = response?.data ?? [];

  return data.map((ticket: any) => ({
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    prospectId: ticket.prospect?.id ?? 0,
    prospectName: ticket.prospect?.user
      ? `${ticket.prospect.user.firstName} ${ticket.prospect.user.lastName}`
      : "",
  }));
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

async updateStatus (id: number, status: string) {
  const currentTicket = await apiClient.get(`/helpdesk/tickets`).then((res) =>
    res.data?.data?.find((ticket: any) => ticket.id === id)
  );

  if (!currentTicket) {
    throw new Error("Unable to update ticket");
  }

  return this.updateTicket(id, {
    title: currentTicket.title,
    description: currentTicket.description,
    priority: currentTicket.priority,
    status,
    prospect: currentTicket.prospect,
  });
},

async createTicket (payload: CreateTicketPayload) {
  const res = await apiClient.post(`/helpdesk/tickets/new`, payload);
  const data =  res.data;
  console.log("RESULTS: ", data);
  return data;
},

};


