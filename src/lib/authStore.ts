// In-memory user store
export type UserRole = "regular_user" | "ca" | "admin";

export interface User {
  name: string;
  company: string;
  email: string;
  password: string;
  roles: UserRole[];
  isDisabled?: boolean;
  createdAt?: Date;
}

interface AuthStore {
  users: User[];
  currentUser: User | null;
  activeRole: UserRole | null;
}

const authStore: AuthStore = {
  users: [
    {
      name: "Admin",
      company: "Numor",
      email: "admin@numor.com",
      password: "admin",
      roles: ["admin"],
      isDisabled: false,
      createdAt: new Date("2024-01-01"),
    },
  ],
  currentUser: null,
  activeRole: null,
};

export const registerUser = (user: Omit<User, 'roles'> & { roles?: UserRole[] }): { success: boolean; error?: string } => {
  const existingUser = authStore.users.find((u) => u.email === user.email);
  const requestedRoles = user.roles || ["regular_user"];
  
  if (existingUser) {
    // If user exists and trying to register as CA, add "ca" role if not already present
    if (requestedRoles.includes("ca") && !existingUser.roles.includes("ca")) {
      existingUser.roles.push("ca");
      return { success: true };
    }
    return { success: false, error: "User with this email already exists" };
  }
  
  authStore.users.push({
    ...user,
    roles: requestedRoles,
    isDisabled: false,
    createdAt: new Date(),
  });
  return { success: true };
};

export const loginUser = (email: string, password: string): { success: boolean; user?: User; error?: string } => {
  const user = authStore.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }
  if (user.isDisabled) {
    return { success: false, error: "Your account has been disabled. Please contact support." };
  }
  authStore.currentUser = user;
  // Set active role: prefer "admin" if available, then "ca", otherwise "regular_user"
  authStore.activeRole = user.roles.includes("admin") 
    ? "admin" 
    : user.roles.includes("ca") 
      ? "ca" 
      : "regular_user";
  return { success: true, user };
};

export const logoutUser = (): void => {
  authStore.currentUser = null;
  authStore.activeRole = null;
};

export const getCurrentUser = (): User | null => {
  return authStore.currentUser;
};

export const getActiveRole = (): UserRole | null => {
  return authStore.activeRole;
};

export const setActiveRole = (role: UserRole): void => {
  if (authStore.currentUser?.roles.includes(role)) {
    authStore.activeRole = role;
  }
};

export const hasRole = (role: UserRole): boolean => {
  return authStore.currentUser?.roles.includes(role) ?? false;
};

// Admin functions
export const getAllUsers = (): User[] => {
  return authStore.users.filter(u => !u.roles.includes("admin"));
};

export const getUserByEmail = (email: string): User | undefined => {
  return authStore.users.find(u => u.email === email);
};

export const toggleUserDisabled = (email: string): { success: boolean; error?: string } => {
  const user = authStore.users.find(u => u.email === email);
  if (!user) {
    return { success: false, error: "User not found" };
  }
  if (user.roles.includes("admin")) {
    return { success: false, error: "Cannot disable admin users" };
  }
  user.isDisabled = !user.isDisabled;
  return { success: true };
};

export const updateUserRoles = (email: string, roles: UserRole[]): { success: boolean; error?: string } => {
  const user = authStore.users.find(u => u.email === email);
  if (!user) {
    return { success: false, error: "User not found" };
  }
  if (user.roles.includes("admin")) {
    return { success: false, error: "Cannot modify admin user roles" };
  }
  user.roles = roles;
  return { success: true };
};

export const deleteUser = (email: string): { success: boolean; error?: string } => {
  const userIndex = authStore.users.findIndex(u => u.email === email);
  if (userIndex === -1) {
    return { success: false, error: "User not found" };
  }
  if (authStore.users[userIndex].roles.includes("admin")) {
    return { success: false, error: "Cannot delete admin users" };
  }
  authStore.users.splice(userIndex, 1);
  return { success: true };
};
