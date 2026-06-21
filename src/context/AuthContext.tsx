import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService, type MeResponse } from "../services/auth";
import { tokenStore } from "../utils/token";
import type { UserRole } from "../utils/roles";

interface AuthContextValue {
  user: MeResponse | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<MeResponse>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(async () => {
    if (!tokenStore.getAccess()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await authService.me();
      setUser(me);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password);
    tokenStore.setSession({
      access: res.access,
      refresh: res.refresh,
      role: res.role,
      email: res.email,
    });
    const me = await authService.me();
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: (user?.role as UserRole | undefined) ?? null,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refresh: hydrate,
    }),
    [user, isLoading, login, logout, hydrate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}