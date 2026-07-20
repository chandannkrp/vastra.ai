import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { Role } from "../types";
import { useAuth } from "../lib/auth";

/**
 * Gate a route behind authentication and (optionally) a role.
 * - Not logged in  -> redirect to /login
 * - Wrong role     -> redirect to the user's own dashboard
 */
export function ProtectedRoute({
  children,
  role,
}: {
  children: ReactNode;
  role?: Role;
}) {
  const { user, role: userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-700" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to={userRole === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return <>{children}</>;
}
