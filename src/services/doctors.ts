import { api } from "../api/client";

export const SPECIALIZATIONS = [
  "GENERAL",
  "CARDIOLOGY",
  "DERMATOLOGY",
  "NEUROLOGY",
  "ORTHOPEDICS",
  "PEDIATRICS",
] as const;
export type Specialization = (typeof SPECIALIZATIONS)[number];

export interface DoctorProfile {
  id: number;
  full_name: string;
  specialization: Specialization;
  hospital_name: string;
  experience_years: number;
  phone_number: string;
  license_number: string;
  address: string;
}

export type DoctorProfileInput = Omit<DoctorProfile, "id">;

export interface DoctorSearchResult {
  id: number;
  full_name: string;
  specialization: Specialization;
  hospital_name: string;
  experience_years: number;
}

export interface DoctorSearchFilters {
  name?: string;
  specialization?: Specialization | "";
}

export const doctorsService = {
  async getMyProfile() {
    const { data } = await api.get<DoctorProfile>("doctor/profile/");
    return data;
  },
  async createMyProfile(input: DoctorProfileInput) {
    const { data } = await api.post<DoctorProfile>("doctor/profile/", input);
    return data;
  },
  async search(filters: DoctorSearchFilters) {
    const params: Record<string, string> = {};
    if (filters.name?.trim()) params.name = filters.name.trim();
    if (filters.specialization) params.specialization = filters.specialization;
    const { data } = await api.get<DoctorSearchResult[]>("doctor/search/", { params });
    return data;
  },
};