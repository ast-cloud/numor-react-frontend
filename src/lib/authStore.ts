// Type definitions for authentication (no in-memory storage)
export type UserRole = "SME_USER" | "CA_USER" | "ADMIN";

export interface User {
  name: string;
  company: string;
  email: string;
  roles: UserRole[];
  isDisabled?: boolean;
  createdAt?: string;
}
