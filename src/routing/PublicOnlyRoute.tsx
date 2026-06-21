import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { dashboardPathFor } from "../utils/roles";

export default function PublicOnlyRoute() {
  const { isAuthenticated, isLoading, role } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to={dashboardPathFor(role)} replace />;
  return <Outlet />;
}