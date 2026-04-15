import { apiClient } from "@/lib/axios";
import type {
  AuthResponse,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
} from "../types/auth.types";

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  async signup(payload: SignupPayload) {
    const { data } = await apiClient.post<AuthResponse>("/auth/signup", payload);
    return data;
  },

  async verifyRegistration(token: string) {
    const { data } = await apiClient.get<AuthResponse>("/auth/verify-registration", {
      params: { token },
    });
    return data;
  },

  async getCurrentUser() {
    const { data } = await apiClient.get<AuthUser>("/auth/me");
    return data;
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    const { data } = await apiClient.post("/auth/forgot-password", payload);
    return data;
  },

  async resetPassword(payload: ResetPasswordPayload) {
    const { data } = await apiClient.post("/auth/reset-password", payload);
    return data;
  },
};
