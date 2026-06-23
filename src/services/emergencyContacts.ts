import { api } from "../api/client";

export const RELATIONS = [
  "FATHER",
  "MOTHER",
  "BROTHER",
  "SISTER",
  "SPOUSE",
  "FRIEND",
  "OTHER",
] as const;
export type Relation = (typeof RELATIONS)[number];

export type ContactRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";
export type RemovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface MyEmergencyContact {
  id: number;
  email: string;
  relation: Relation;
}

export interface PatientWhoAddedMe {
  id: number;
  patient_name: string;
  relation: Relation;
}

export interface EmergencyContactsList {
  my_emergency_contacts: MyEmergencyContact[];
  patients_who_added_me: PatientWhoAddedMe[];
}

export interface IncomingContactRequest {
  id: number;
  patient_name: string;
  relation: Relation;
  status: ContactRequestStatus;
}

export interface RemovalRequest {
  id: number;
  contact_name: string;
  status: RemovalStatus;
}

export const emergencyContactsService = {
  async list() {
    const { data } = await api.get<EmergencyContactsList>("emergency-contacts/");
    return data;
  },
  async sendRequest(input: { email: string; relation: Relation }) {
    const { data } = await api.post("emergency-contacts/request/", input);
    return data;
  },
  async listIncomingRequests() {
    const { data } = await api.get<IncomingContactRequest[]>(
      "emergency-contacts/request/",
    );
    return data;
  },
  async respondToRequest(id: number, status: "ACCEPTED" | "REJECTED") {
    const { data } = await api.patch(`emergency-contacts/request/${id}/`, {
      status,
    });
    return data;
  },
  async directRemove(emergencyContactId: number) {
    const { data } = await api.delete(
      `emergency-contacts/${emergencyContactId}/`,
    );
    return data;
  },
  async requestRemoval(emergencyContactId: number) {
    const { data } = await api.post("emergency-contacts/remove-request/", {
      emergency_contact_id: emergencyContactId,
    });
    return data;
  },
  async listRemovalRequests() {
    const { data } = await api.get<RemovalRequest[]>(
      "emergency-contacts/remove-request/list/",
    );
    return data;
  },
  async respondToRemoval(id: number, status: "APPROVED" | "REJECTED") {
    const { data } = await api.patch(
      `emergency-contacts/remove-request/${id}/`,
      { status },
    );
    return data;
  },
};