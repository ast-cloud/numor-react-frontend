import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import type { ModuleKey } from "@/lib/authStore";
import { firstAllowedRoute } from "@/lib/permissions";

type Props = {
  module: ModuleKey;
  action?: "read" | "write";
  children: React.ReactNode;
};

const PermissionGuard = ({ module, action = "read", children }: Props) => {
  const { can, isSubAccount, user } = useAuth();

  if (!isSubAccount) return <>{children}</>;
  if (can(module, action)) return <>{children}</>;

  const fallback = firstAllowedRoute(user?.permissions ?? null);
  return <Navigate to={fallback} replace />;
};

export default PermissionGuard;
