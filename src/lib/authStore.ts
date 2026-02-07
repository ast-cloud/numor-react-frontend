// Type definitions for authentication (no in-memory storage)
export type UserRole = "regular_user" | "ca" | "admin";

export interface User {
  name: string;
  company: string;
  email: string;
  roles: UserRole[];
  isDisabled?: boolean;
  createdAt?: string;
}
