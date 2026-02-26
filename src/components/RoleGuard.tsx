import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/lib/authStore";

const RoleGuard = ({ role, children }: { role: UserRole; children: React.ReactNode }) => {
  const { hasRole } = useAuth();

  if (!hasRole(role)) {
    return <Navigate to="/sme/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
