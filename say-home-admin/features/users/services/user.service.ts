import { apiFetch } from "@/shared/lib/api-fetch";
import type {
  AdminUserItem,
  AdminUsersResponse,
  CreateUserPayload,
  UpdateUserPayload,
} from "../types/user.types";

const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api";

export const userService = {
  async getUsers(): Promise<AdminUsersResponse> {
    const response = await apiFetch(`${API_BASE_URL}/admin/users`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to load agents");
    }

    const result = await response.json();
    return result.data as AdminUsersResponse;
  },

  async getUserById(id: number): Promise<AdminUserItem> {
    const response = await apiFetch(`${API_BASE_URL}/admin/users/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to load agent");
    }

    const result = await response.json();
    return result.data as AdminUserItem;
  },

  async createUser(payload: CreateUserPayload) {
    const response = await apiFetch(`${API_BASE_URL}/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Unable to create agent");
    }
  },

  async updateUser(id: number, payload: UpdateUserPayload) {
    const response = await apiFetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Unable to update agent");
    }
  },

  async toggleUser(id: number) {
    const response = await apiFetch(`${API_BASE_URL}/admin/users/${id}/toggle-active`, {
      method: "PATCH",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Unable to update agent status");
    }
  },
};
