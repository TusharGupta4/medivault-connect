import { api } from "../api/client";

export interface LoginResponse {
  access: string;
  refresh: string;
  role: "PATIENT" | "DOCTOR";
  email: string;
}

export interface MeResponse {
  id: number;
  email: string;
  role: "PATIENT" | "DOCTOR";
}

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post<LoginResponse>("auth/login/", { email, password });
    return data;
  },
  async register(email: string, password: string, role: "PATIENT" | "DOCTOR") {
    const { data } = await api.post<{ message: string }>("auth/register/", {
      email,
      password,
      role,
    });
    return data;
  },
  async me() {
    const { data } = await api.get<MeResponse>("auth/me/");
    return data;
  },
};