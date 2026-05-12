import { apiClient } from "@/shared/lib/axios";
import type { TicketApiResponse, UserTicket } from "../types/ticket.types";

type RawUserTicket = UserTicket & {
  prospect?: unknown;
};

export const ticketService = {
  async getMyTickets(): Promise<UserTicket[]> {
    const { data } = await apiClient.get<TicketApiResponse<RawUserTicket[]>>(
      "/helpdesk/tickets/me",
    );

    return (data.data ?? []).map(({ prospect: _prospect, ...ticket }) => ticket);
  },
};
