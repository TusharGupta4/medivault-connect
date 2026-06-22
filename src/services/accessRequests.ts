import { api } from "../api/client";

export const ACCESS_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REVOKED",
] as const;
export type AccessStatus = (typeof ACCESS_STATUSES)[number];

export interface IncomingAccessRequest {
  id: number;
  patient: number;
  doctor: number;
  status: AccessStatus;
  created_at: string;
}

export interface DoctorAccessHistoryItem {
  id: number;
  patient_id: number;
  patient_name: string;
  status: AccessStatus;
  created_at: string;
  approved_at: string | null;
  ended_at: string | null;
}

export interface SendAccessRequestResponse {
  id: number;
  patient: number;
  doctor: number;
  status: AccessStatus;
}

export const accessRequestsService = {
  async send(patientId: number) {
    const { data } = await api.post<SendAccessRequestResponse>(
      "access-requests/",
      { patient: patientId },
    );
    return data;
  },
  async listIncoming() {
    const { data } = await api.get<IncomingAccessRequest[]>("access-requests/");
    return data;
  },
  async history() {
    const { data } = await api.get<DoctorAccessHistoryItem[]>(
      "access-requests/history/",
    );
    return data;
  },
  async updateStatus(id: number, status: AccessStatus) {
    const { data } = await api.patch<{ id: number; status: AccessStatus }>(
      `access-requests/${id}/`,
      { status },
    );
    return data;
  },
};