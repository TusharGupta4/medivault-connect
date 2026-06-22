import { api } from "../api/client";

export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
export type Gender = (typeof GENDERS)[number];

export const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export interface PatientProfile {
  id: number;
  full_name: string;
  date_of_birth: string;
  gender: Gender;
  blood_group: BloodGroup;
  phone_number: string;
  address: string;
  emergency_contact: string;
}

export type PatientProfileInput = Omit<PatientProfile, "id">;

export interface PatientSearchResult {
  id: number;
  full_name: string;
  email: string;
}

export const patientsService = {
  async getMyProfile() {
    const { data } = await api.get<PatientProfile>("patient/profile/");
    return data;
  },
  async createMyProfile(input: PatientProfileInput) {
    const { data } = await api.post<PatientProfile>("patient/profile/", input);
    return data;
  },
  async search(q: string) {
    const { data } = await api.get<PatientSearchResult[]>("patient/search/", {
      params: { q },
    });
    return data;
  },
};