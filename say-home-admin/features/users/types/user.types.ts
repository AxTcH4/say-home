export interface AdminUserItem {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  role: string;
  activeProspects: number;
  active: boolean;
}

export interface AdminUsersResponse {
  items: AdminUserItem[];
  total: number;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}
