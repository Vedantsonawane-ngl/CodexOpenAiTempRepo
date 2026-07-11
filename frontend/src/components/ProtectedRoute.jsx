import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] text-primary">
        <div className="flex flex-col items-center gap-md">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
          <span className="font-geist text-[10px] uppercase tracking-[0.25em] text-on-surface-variant animate-pulse">
            Establishing Secure Session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
