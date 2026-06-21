export const Role = {
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR",
} as const;

export type UserRole = (typeof Role)[keyof typeof Role];

export const dashboardPathFor = (role: string | null | undefined) => {
  if (role === Role.PATIENT) return "/patient/dashboard";
  if (role === Role.DOCTOR) return "/doctor/dashboard";
  return "/login";
};