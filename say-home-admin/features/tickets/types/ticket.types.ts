export interface TicketItem {
  id: number;
  title: string;
  description: string;
  status: string;
  prospectId: number;
  prospectName: string;
}

export interface CreateTicketPayload {
  prospectId: number;
  title: string;
  description: string;
}
