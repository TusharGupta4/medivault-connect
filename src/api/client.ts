import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStore } from "../utils/token";

const baseURL =
  (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8000/api/";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pending: Array<(token: string | null) => void> = [];

const subscribe = (cb: (token: string | null) => void) => pending.push(cb);
const publish = (token: string | null) => {
  pending.forEach((cb) => cb(token));
  pending = [];
};

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    // Don't try to refresh the refresh/login endpoints themselves
    if (original.url?.includes("/auth/login") || original.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    const refresh = tokenStore.getRefresh();
    if (!refresh) {
      tokenStore.clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribe((token) => {
          if (!token) return reject(error);
          (original.headers as any).Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(`${baseURL}auth/refresh/`, { refresh });
      const newAccess = data.access as string;
      tokenStore.setAccess(newAccess);
      publish(newAccess);
      (original.headers as any).Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (err) {
      publish(null);
      tokenStore.clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export const extractApiError = (err: unknown, fallback = "Something went wrong") => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as any;
    if (typeof data === "string") return data;
    if (data?.detail) return data.detail;
    if (data?.error) return data.error;
    if (data?.non_field_errors?.[0]) return data.non_field_errors[0];
    if (data && typeof data === "object") {
      const first = Object.entries(data)[0];
      if (first) {
        const [field, val] = first;
        const msg = Array.isArray(val) ? val[0] : String(val);
        return `${field}: ${msg}`;
      }
    }
    return err.message || fallback;
  }
  return fallback;
};