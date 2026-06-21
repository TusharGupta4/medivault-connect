const ACCESS_KEY = "medivault.access";
const REFRESH_KEY = "medivault.refresh";
const ROLE_KEY = "medivault.role";
const EMAIL_KEY = "medivault.email";

export const tokenStore = {
  getAccess: () => (typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY)),
  getRefresh: () => (typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY)),
  getRole: () => (typeof window === "undefined" ? null : localStorage.getItem(ROLE_KEY)),
  getEmail: () => (typeof window === "undefined" ? null : localStorage.getItem(EMAIL_KEY)),
  setSession: (data: { access: string; refresh: string; role: string; email: string }) => {
    localStorage.setItem(ACCESS_KEY, data.access);
    localStorage.setItem(REFRESH_KEY, data.refresh);
    localStorage.setItem(ROLE_KEY, data.role);
    localStorage.setItem(EMAIL_KEY, data.email);
  },
  setAccess: (access: string) => localStorage.setItem(ACCESS_KEY, access),
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(EMAIL_KEY);
  },
};