import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "@/lib/api/authToken";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("token");
    const redirect = params.get("redirect") || "/sme/dashboard";

    // Clear hash immediately
    window.history.replaceState(null, "", window.location.pathname);

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setToken(token);
    refreshUser().then(() => {
      navigate(redirect, { replace: true });
    });
  }, [navigate, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default AuthCallback;
