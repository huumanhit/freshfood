import { Role } from "@prisma/client";

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}
