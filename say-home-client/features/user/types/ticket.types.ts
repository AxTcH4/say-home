export type TicketStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";
export type TicketPriority = "HIGH" | "MEDIUM" | "LOW";

export interface UserTicket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  updatedAt: string;
}

export interface TicketApiResponse<T> {
  message: string;
  success: boolean;
  data: T;
  error?: string | null;
}
