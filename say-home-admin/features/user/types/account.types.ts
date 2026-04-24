export interface DashboardProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
}

export interface DashboardProfileUpdatePayload {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface DashboardSummary {
  boughtProperties: number;
  rentedProperties: number;
  negotiatingProperties: number;
  ticketsCount: number;
}

export interface ApiResponse<T> {
  message: string;
  success: boolean;
  data: T;
  error?: string | null;
}
