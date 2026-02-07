import { Navigate } from "react-router-dom";
import { getToken } from "@/lib/api/authToken";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getToken();
  const { user, isLoading } = useAuth();

  // Fast redirect if no token at all
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while verifying user
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if user couldn't be fetched (invalid token)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
