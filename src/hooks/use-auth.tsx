import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from "react";
import { getToken, clearToken } from "@/lib/api/authToken";
import { fetchCurrentUser } from "@/lib/api/user";
import { login as apiLogin } from "@/lib/api/auth";
import type { UserRole, ModulePermissions, ModuleKey } from "@/lib/authStore";
import { can as canCheck, normalizePermissions } from "@/lib/permissions";

export interface AuthUser {
  name: string;
  email: string;
  company?: string;
  roles: UserRole[];
  permissions: ModulePermissions | null;
  isOrgOwner: boolean;
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
  isSubAccount: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  setActiveRole: (role: UserRole) => void;
  refreshUser: () => Promise<void>;
  can: (module: ModuleKey, action: "read" | "write") => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ACTIVE_ROLE_KEY = "active_role";

const mapBackendRole = (role: string): UserRole => {
  switch (role?.toUpperCase()) {
    case "ADMIN": return "ADMIN";
    case "CA_USER": return "CA_USER";
    case "CA": return "CA_USER";
    case "SME_USER": return "SME_USER";
    case "REGULAR_USER": return "SME_USER";
    case "SUB_ACCOUNT": return "SUB_ACCOUNT";
    default: return "SME_USER";
  }
};

const parseRoles = (data: Record<string, unknown>): UserRole[] => {
  if (Array.isArray(data.roles)) {
    return data.roles.map((r: string) => mapBackendRole(r));
  }
  if (typeof data.role === "string") {
    return [mapBackendRole(data.role)];
  }
  return ["SME_USER"];
};

const resolveActiveRole = (roles: UserRole[]): UserRole => {
  if (roles.includes("SUB_ACCOUNT")) return "SUB_ACCOUNT";

  const saved = localStorage.getItem(ACTIVE_ROLE_KEY) as UserRole | null;
  const canRestoreSavedRole =
    !!saved &&
    (roles.includes(saved) || (saved === "SME_USER" && roles.includes("CA_USER")));

  if (canRestoreSavedRole && saved) return saved;
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("CA_USER")) return "CA_USER";
  return "SME_USER";
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetUser = useCallback(async (): Promise<{ user: AuthUser | null; role: UserRole | null }> => {
    try {
      const data = await fetchCurrentUser();
      const roles = parseRoles(data);
      const isOrgOwner = !!data.isOrgOwner;
      const permissions = isOrgOwner ? null : normalizePermissions(data.permissions);
      const authUser: AuthUser = {
        name: data.name || "",
        email: data.email || "",
        company: data.company || data.organization?.name || "",
        roles,
        permissions,
        isOrgOwner,
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
    if (!user) return;
    if (user.roles.includes("SUB_ACCOUNT")) return; // sub-accounts cannot switch

    const canSwitchToRole =
      user.roles.includes(role) ||
      (role === "SME_USER" && user.roles.includes("CA_USER"));

    if (canSwitchToRole) {
      setActiveRoleState(role);
      localStorage.setItem(ACTIVE_ROLE_KEY, role);
    }
  }, [user]);

  const isSubAccount = useMemo(() => user?.roles.includes("SUB_ACCOUNT") ?? false, [user]);

  const can = useCallback(
    (module: ModuleKey, action: "read" | "write") =>
      canCheck(user?.permissions ?? null, module, action, isSubAccount),
    [user, isSubAccount],
  );

  return (
    <AuthContext.Provider value={{ user, activeRole, isLoading, isSubAccount, login, logout, hasRole, setActiveRole, refreshUser, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
