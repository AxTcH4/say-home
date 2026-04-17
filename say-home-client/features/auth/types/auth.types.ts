export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LogoutPayload {
  token: string;
}

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: AuthUser;
}
