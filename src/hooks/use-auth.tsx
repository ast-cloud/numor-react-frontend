import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getToken, clearToken } from "@/lib/api/authToken";
import { fetchCurrentUser } from "@/lib/api/user";
import { login as apiLogin } from "@/lib/api/auth";
import type { UserRole } from "@/lib/authStore";

export interface AuthUser {
  name: string;
  email: string;
  company?: string;
  roles: UserRole[];
}

interface LoginResult {
  success: boolean;
  error?: string;
  activeRole?: UserRole | null;
}

interface AuthContextType {
  user: AuthUser | null;
  activeRole: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  setActiveRole: (role: UserRole) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ACTIVE_ROLE_KEY = "active_role";

const mapBackendRole = (role: string): UserRole => {
  switch (role?.toUpperCase()) {
    case "ADMIN": return "admin";
    case "CA_USER": return "ca";
    case "CA": return "ca";
    case "SME_USER": return "regular_user";
    case "REGULAR_USER": return "regular_user";
    default: return "regular_user";
  }
};

const parseRoles = (data: Record<string, unknown>): UserRole[] => {
  if (Array.isArray(data.roles)) {
    return data.roles.map((r: string) => mapBackendRole(r));
  }
  if (typeof data.role === "string") {
    return [mapBackendRole(data.role)];
  }
  return ["regular_user"];
};

const resolveActiveRole = (roles: UserRole[]): UserRole => {
  const saved = localStorage.getItem(ACTIVE_ROLE_KEY) as UserRole;
  if (saved && roles.includes(saved)) return saved;
  if (roles.includes("admin")) return "admin";
  if (roles.includes("ca")) return "ca";
  return "regular_user";
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetUser = useCallback(async (): Promise<{ user: AuthUser | null; role: UserRole | null }> => {
    try {
      const data = await fetchCurrentUser();
      const roles = parseRoles(data);
      const authUser: AuthUser = {
        name: data.name || "",
        email: data.email || "",
        company: data.company || data.organization?.name || "",
        roles,
      };
      setUser(authUser);
      const role = resolveActiveRole(roles);
      setActiveRoleState(role);
      localStorage.setItem(ACTIVE_ROLE_KEY, role);
      return { user: authUser, role };
    } catch {
      setUser(null);
      setActiveRoleState(null);
      clearToken();
      return { user: null, role: null };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setActiveRoleState(null);
      setIsLoading(false);
      return;
    }
    await fetchAndSetUser();
    setIsLoading(false);
  }, [fetchAndSetUser]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const result = await apiLogin(email, password);
      if (result.success) {
        const { role } = await fetchAndSetUser();
        return { success: true, activeRole: role };
      }
      return { success: false, error: result.error || result.message };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, [fetchAndSetUser]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setActiveRoleState(null);
    localStorage.removeItem(ACTIVE_ROLE_KEY);
  }, []);

  const hasRole = useCallback((role: UserRole) => user?.roles.includes(role) ?? false, [user]);

  const setActiveRole = useCallback((role: UserRole) => {
    if (user?.roles.includes(role)) {
      setActiveRoleState(role);
      localStorage.setItem(ACTIVE_ROLE_KEY, role);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, activeRole, isLoading, login, logout, hasRole, setActiveRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
