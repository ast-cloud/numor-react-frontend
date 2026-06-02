// Type definitions for authentication (no in-memory storage)
export type UserRole = "SME_USER" | "CA_USER" | "ADMIN" | "SUB_ACCOUNT";

export type ModuleKey = "dashboard" | "income" | "expense" | "organizationSettings";

export type ModulePermissions = {
  [K in ModuleKey]: { read: boolean; write: boolean };
};

export interface User {
  name: string;
  company: string;
  email: string;
  roles: UserRole[];
  permissions?: ModulePermissions | null;
  isDisabled?: boolean;
  createdAt?: string;
}
